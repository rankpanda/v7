import React from 'react';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Button } from './ui/button';

export const KeywordTable = ({ data, onKeywordUpdate }) => {
  const columns: ColumnDef[] = [
    {
      accessorKey: 'keyword',
      header: 'Keyword',
      size: 300,
      cell: ({ row }) => (
        <div className="p-2">
          {row.original.keyword}
        </div>
      )
    },
    {
      accessorKey: 'volume',
      header: 'Volume',
      size: 100,
      cell: ({ row }) => (
        <div className="p-2 text-right">
          {row.original.volume}
        </div>
      )
    },
    {
      accessorKey: 'autoSuggestions',
      header: 'Auto Suggest',
      minSize: 600,
      cell: ({ row }) => {
        const keyword = row.original;
        const [value, setValue] = React.useState(
          Array.isArray(keyword.autoSuggestions) 
            ? keyword.autoSuggestions.join(', ')
            : keyword.autoSuggestions || ''
        );

        const handleSave = () => {
          const updatedKeyword = {
            ...keyword,
            autoSuggestions: value.split(',').map(s => s.trim()).filter(Boolean)
          };
          onKeywordUpdate(updatedKeyword);
        };

        return (
          <div className="auto-suggest-wrapper p-2">
            <div className="flex flex-col gap-2">
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="auto-suggest-textarea"
                rows={3}
              />
              <Button
                onClick={handleSave}
                size="sm"
                variant="outline"
                className="self-end px-4"
              >
                Save
              </Button>
            </div>
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="keywords-table-wrapper overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="text-left p-2 bg-gray-50 border-b font-medium text-gray-600"
                  style={{ 
                    width: header.column.columnDef.size,
                    minWidth: header.column.columnDef.minSize 
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-b">
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  style={{ 
                    width: cell.column.columnDef.size,
                    minWidth: cell.column.columnDef.minSize
                  }}
                >
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 