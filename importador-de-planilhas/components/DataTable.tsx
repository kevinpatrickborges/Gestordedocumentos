
import React from 'react';
import type { SheetData, SheetRow } from '../types';

interface DataTableProps {
  headers: string[];
  data: SheetData;
}

export const DataTable: React.FC<DataTableProps> = ({ headers, data }) => {
  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg max-h-[60vh]">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="py-3 px-6">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              {headers.map((header, colIndex) => (
                <td key={`${rowIndex}-${colIndex}`} className="py-4 px-6">
                  {String(row[header])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
