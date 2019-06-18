export interface SheetInfo {
    colsInfo: ColInfo[];
    grouped: Row[];
    ungrouped: UngroupedCell[];
}
export interface Row {
    [key: string]: string | boolean;
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
    Time = "Time",
    DateTime = "DateTime",
    Error = "Error"
}
