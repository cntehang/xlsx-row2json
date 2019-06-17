export interface SheetInfo {
    colsInfo: ColInfo[];
    grouped: any[];
    ungrouped: UngroupedCell[];
}
export interface UngroupedCell {
    cellName: string;
    value: string;
}
export interface ColInfo {
    colName: string;
    colKey: string;
    dataType: Type;
}
export declare enum Type {
    Boolean = "boolean",
    String = "string",
    Number = "number",
    Date = "Date",
    Error = "Error"
}
