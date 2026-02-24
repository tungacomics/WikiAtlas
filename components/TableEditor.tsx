import React, { useState } from 'react';
import { Icons } from './Icon';

interface TableEditorProps {
  onInsert: (markdown: string) => void;
  onClose: () => void;
}

export const TableEditor: React.FC<TableEditorProps> = ({ onInsert, onClose }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [data, setData] = useState<string[][]>(Array(3).fill(null).map(() => Array(3).fill('')));

  const handleCellChange = (r: number, c: number, value: string) => {
    const newData = [...data];
    newData[r][c] = value;
    setData(newData);
  };

  const addRow = () => {
    setRows(rows + 1);
    setData([...data, Array(cols).fill('')]);
  };

  const addCol = () => {
    setCols(cols + 1);
    setData(data.map(row => [...row, '']));
  };

  const generateMarkdown = () => {
    let md = '\n';
    // Header
    md += '| ' + data[0].join(' | ') + ' |\n';
    // Separator
    md += '| ' + data[0].map(() => '---').join(' | ') + ' |\n';
    // Body
    for (let i = 1; i < rows; i++) {
      md += '| ' + data[i].join(' | ') + ' |\n';
    }
    md += '\n';
    onInsert(md);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-soft-in">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900">Visual Jadval Muharriri</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Jadvalni vizual tarzda yarating</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Icons.X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="inline-block min-w-full border border-gray-100 rounded-2xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {Array(cols).fill(null).map((_, c) => (
                    <th key={c} className="border border-gray-200 p-0">
                      <input 
                        value={data[0][c]} 
                        onChange={e => handleCellChange(0, c, e.target.value)}
                        placeholder={`Sarlavha ${c + 1}`}
                        className="w-full p-3 bg-transparent border-none text-xs font-black uppercase text-center focus:ring-0"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array(rows - 1).fill(null).map((_, r) => (
                  <tr key={r}>
                    {Array(cols).fill(null).map((_, c) => (
                      <td key={c} className="border border-gray-200 p-0">
                        <input 
                          value={data[r + 1][c]} 
                          onChange={e => handleCellChange(r + 1, c, e.target.value)}
                          placeholder="..."
                          className="w-full p-3 bg-transparent border-none text-sm font-medium text-center focus:ring-0"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 mt-6">
            <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase hover:bg-gray-200 transition-all">
              <Icons.Plus className="w-3 h-3" /> Qator qo'shish
            </button>
            <button onClick={addCol} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase hover:bg-gray-200 transition-all">
              <Icons.Plus className="w-3 h-3" /> Ustun qo'shish
            </button>
          </div>
        </div>

        <div className="p-8 border-t border-gray-100 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 text-gray-500 font-bold uppercase text-[10px] tracking-widest hover:text-gray-900 transition-colors">Bekor qilish</button>
          <button onClick={generateMarkdown} className="px-8 py-3 bg-brand-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all">Jadvalni kiritish</button>
        </div>
      </div>
    </div>
  );
};
