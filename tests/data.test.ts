import { parse, getData } from '../src/index'
import { Type, SheetInfo } from '../src/models'

const result = parse('./files/t.xlsx')
const grouped = getData('./files')
const sheet = result.get('T') as SheetInfo
const groupedSheet = grouped.get('TCase')
describe('check', function() {
  it('dataType is right', function() {
    const cols = sheet.colsInfo
    expect(cols[0].dataType).toBe(Type.Boolean)
    expect(cols[1].dataType).toBe(Type.String)
    expect(cols[2].dataType).toBe(Type.String)
    expect(cols[3].dataType).toBe(Type.String)
    expect(cols[4].dataType).toBe(Type.String)
    expect(cols[5].dataType).toBe(Type.String)
  })

  it('value is right', function() {
    const data = sheet.grouped[0] as any
    expect(data.bool).toBeFalsy()
    expect(data.number).toBe('666')
    expect(data.date).toBe('1990-06-19')
    expect(data.datetime).toBe('2019-06-19 06:18')
    expect(data.time).toBe('06:18')
    expect(data.str).toBe('test')
  })

  it('grouped data', () => {
    expect(groupedSheet).toBeInstanceOf(Array)
  })
})
