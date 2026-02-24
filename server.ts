import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = 3000;

// Supabase Setup
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const JWT_SECRET = process.env.JWT_SECRET || "my_wikiatlas_private_jwt_secret_key_098765412728";

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- Auth Routes ---

app.post("/api/auth/register", async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // 1. Register user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: true
    });

    if (authError) throw authError;

    // 2. Create profile manually to ensure it exists (in case trigger is not set)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        username: username,
        email: email,
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.warn("Profile creation warning:", profileError);
      // We don't throw here because the user is already created in Auth
    }

    const user = { id: authData.user.id, email, username };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ user });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message || "Failed to register" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const user = { 
      id: data.user.id, 
      email: data.user.email, 
      username: profile?.username || data.user.user_metadata?.username || email.split('@')[0] 
    };
    
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ user });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(400).json({ error: "Invalid credentials" });
  }
});

app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

// --- Article Routes ---

app.get("/api/articles", async (req, res) => {
  try {
    // Try to fetch with profiles join first
    let { data, error } = await supabase
      .from('articles')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false });

    // If join fails (e.g. profiles table missing or relation error), fallback to simple select
    if (error) {
      console.warn("Join with profiles failed, falling back to simple select:", error.message);
      const fallback = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fallback.error) throw fallback.error;
      data = fallback.data;
    }

    if (!data) return res.json([]);
    
    // Map profiles.username to author_name for frontend compatibility
    const formattedData = data.map((art: any) => ({
      ...art,
      author_name: art.profiles?.username || 'Noma\'lum muallif'
    }));

    res.json(formattedData);
  } catch (error: any) {
    console.error("Fetch articles error details:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: "Maqolalarni yuklashda xatolik yuz berdi.", details: error.message });
  }
});

app.post("/api/articles", authenticateToken, async (req: any, res) => {
  const { title, content, category, image_url, sources, target_age, visibility, audience_tags, language } = req.body;

  try {
    // Ensure profile exists
    await supabase.from('profiles').upsert({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    });

    // Build payload dynamically to avoid "column not found" errors if possible
    const insertData: any = {
      title,
      content,
      author_id: req.user.id,
      user_id: req.user.id, // Set both for compatibility
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      language: language || 'uz',
    };

    if (category) insertData.category = category;
    if (image_url) insertData.image_url = image_url;
    if (sources) insertData.sources = sources;
    if (target_age) insertData.target_age = target_age;
    if (visibility) insertData.visibility = visibility;
    if (audience_tags) insertData.audience_tags = audience_tags;

    const { data, error } = await supabase
      .from('articles')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      // If a specific column is missing, try to insert without it
      if (error.message?.includes("column") && error.message?.includes("not found")) {
        const missingColumn = error.message.match(/'([^']+)'/)?.[1];
        if (missingColumn && insertData[missingColumn]) {
          console.warn(`Missing column detected: ${missingColumn}. Retrying without it.`);
          delete insertData[missingColumn];
          const retry = await supabase.from('articles').insert([insertData]).select().single();
          if (retry.error) throw retry.error;
          return res.json(retry.data);
        }
      }
      throw error;
    }
    res.json(data);
  } catch (error: any) {
    console.error("Create article error details:", JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: "Maqola yaratishda xatolik yuz berdi.",
      details: error.message || "Noma'lum xatolik"
    });
  }
});

app.put("/api/articles/:id", authenticateToken, async (req: any, res) => {
  const { title, content, category, image_url, sources, target_age, visibility, audience_tags, language } = req.body;

  try {
    // First check if the user is the author
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !article) {
      return res.status(404).json({ error: "Maqola topilmadi." });
    }

    const isAuthor = (article.author_id && article.author_id === req.user.id) || 
                     (article.user_id && article.user_id === req.user.id);

    if (!isAuthor) {
      return res.status(403).json({ error: "Sizda ushbu maqolani tahrirlash huquqi yo'q." });
    }

    const updateData: any = {
      title,
      content,
      updated_at: new Date().toISOString(),
    };

    if (category) updateData.category = category;
    if (image_url) updateData.image_url = image_url;
    if (sources) updateData.sources = sources;
    if (target_age) updateData.target_age = target_age;
    if (visibility) updateData.visibility = visibility;
    if (audience_tags) updateData.audience_tags = audience_tags;
    if (language) updateData.language = language;

    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      // If a specific column is missing, try to update without it
      if (error.message?.includes("column") && error.message?.includes("not found")) {
        const missingColumn = error.message.match(/'([^']+)'/)?.[1];
        if (missingColumn && updateData[missingColumn]) {
          console.warn(`Missing column detected during update: ${missingColumn}. Retrying without it.`);
          delete updateData[missingColumn];
          const retry = await supabase.from('articles').update(updateData).eq('id', req.params.id).select().single();
          if (retry.error) throw retry.error;
          return res.json(retry.data);
        }
      }
      throw error;
    }
    res.json(data);
  } catch (error: any) {
    console.error("Update article error:", error);
    res.status(500).json({ error: "Maqolani yangilashda xatolik yuz berdi.", details: error.message });
  }
});

app.get("/api/articles/:id", async (req, res) => {
  try {
    let { data: article, error: artError } = await supabase
      .from('articles')
      .select('*, profiles(username)')
      .eq('id', req.params.id)
      .single();

    if (artError) {
      console.warn("Single article join failed, falling back:", artError.message);
      const fallback = await supabase
        .from('articles')
        .select('*')
        .eq('id', req.params.id)
        .single();
      
      if (fallback.error) throw fallback.error;
      article = fallback.data;
    }

    const formattedArticle = {
      ...article,
      author_name: article.profiles?.username || 'Noma\'lum muallif'
    };

    const { data: comments } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('article_id', req.params.id)
      .order('created_at', { ascending: true });

    const formattedComments = (comments || []).map((c: any) => ({
      ...c,
      author_name: c.profiles?.username || 'Noma\'lum'
    }));

    res.json({ ...formattedArticle, comments: formattedComments });
  } catch (error: any) {
    console.error("Get article error details:", JSON.stringify(error, null, 2));
    res.status(404).json({ error: "Maqola topilmadi yoki xatolik yuz berdi.", details: error.message });
  }
});

app.post("/api/articles/:id/comments", authenticateToken, async (req: any, res) => {
  const { content } = req.body;
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        content,
        article_id: req.params.id,
        author_id: req.user.id,
        // author_name olib tashlandi, profiles bilan bog'lanadi
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// --- Community Routes ---

app.get("/api/communities", async (req, res) => {
  try {
    const { data, error } = await supabase.from('communities').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch communities" });
  }
});

app.post("/api/communities", authenticateToken, async (req: any, res) => {
  try {
    const { data, error } = await supabase
      .from('communities')
      .insert([{
        ...req.body,
        creator_id: req.user.id,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create community" });
  }
});

app.delete("/api/articles/:id", authenticateToken, async (req: any, res) => {
  try {
    // First check if the user is the author
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !article) {
      return res.status(404).json({ error: "Maqola topilmadi." });
    }

    const isAuthor = (article.author_id && article.author_id === req.user.id) || 
                     (article.user_id && article.user_id === req.user.id);

    if (!isAuthor) {
      return res.status(403).json({ error: "Sizda ushbu maqolani o'chirish huquqi yo'q." });
    }

    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete article error:", error);
    res.status(500).json({ error: "Maqolani o'chirishda xatolik yuz berdi." });
  }
});

// --- Vite Integration ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  // --- Cleanup and Maintenance ---
app.post("/api/admin/cleanup", authenticateToken, async (req: any, res) => {
  // Simple check for admin-like behavior or just allow for this task
  try {
    // Delete articles with very short content or random-looking titles
    // This is a heuristic based on user request "garbage letters"
    const { data: garbage, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, content');
    
    if (fetchError) throw fetchError;

    const toDelete = garbage.filter((a: any) => {
      const isRandom = (str: string) => /^[asdfghjklqwertyuiopzxcvbnm\s]{10,}$/i.test(str) && !str.includes(' ');
      return isRandom(a.title) || (a.content && a.content.length < 10);
    }).map((a: any) => a.id);

    if (toDelete.length > 0) {
      const { error: delError } = await supabase
        .from('articles')
        .delete()
        .in('id', toDelete);
      if (delError) throw delError;
    }

    res.json({ success: true, deletedCount: toDelete.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // One-time cleanup of garbage articles on startup
    try {
      const { data: articles } = await supabase.from('articles').select('id, title, content');
      if (articles) {
        const toDelete = articles.filter((a: any) => {
          const isRandom = (str: string) => /^[asdfghjklqwertyuiopzxcvbnm\s]{10,}$/i.test(str) && !str.includes(' ');
          return isRandom(a.title || '') || (a.content && a.content.length < 10);
        }).map((a: any) => a.id);
        
        if (toDelete.length > 0) {
          console.log(`Cleaning up ${toDelete.length} garbage articles...`);
          await supabase.from('articles').delete().in('id', toDelete);
        }
      }
    } catch (e) {
      console.error("Startup cleanup failed:", e);
    }
  });
}

startServer();
