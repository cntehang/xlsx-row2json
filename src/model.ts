export interface SheetInfo {
  colsInfo: ColInfo[];
  grouped: any[]; //
  ungrouped: UngroupedCell[];
}

export interface UngroupedCell {
  cellName: string;
  value: string;
}
export interface ColInfo {
  colName: string; // A ,B ,C
  colKey: string; // 列字段名
  dataType: Type;
}
export enum Type {
  Boolean = "boolean",
  String = "string",
  Number = "number",
  Date = "Date",
  Error = "Error"
}
