# 前端e2e测试

## 什么是e2e测试

e2e 在这里是 end-to-end 端对端的缩写，e2e即端对端测试，是黑盒测试的一种。

端到端测试是一种用于测试应用程序的流是否从头到尾按照设计执行的方法。执行端到端测试的目的是识别系统依赖关系,并确保在各种系统组件和系统之间传递正确的信息。

对于前端来讲，e2e测试的方式是模拟用户行为，控制浏览器执行一系列的页面操作，例如点击按钮、输入文字等等，最后判断结果是否符合预期。

## 测试工具简介

### Protractor

Protractor 是 Angular 官方测试框架，集成了以下功能：

- Selenium WebDriver（操控浏览器）
- WebDriver Manager（驱动管理）
- Jasmine（测试用例）
- Sauce Labs

#### Jasmine 基本概念

##### Suites & Specs

Suites 描述一个测试集。 Jasmine 使用全局函数 `describe` 对相关用例进行分组。

Specs 是组成 Suite 的测试用例。在 Jasmine 中，使用全局函数 `it` 定义。

```javascript
describe("A suite", function() {
  it("contains spec with an expectation", function() {
    expect(true).toBeTruthy()
  });
});
```

##### Expectations & Matchers

Jasmine 使用断言（Expectation）的方式来执行测试结果。如果 `it` 方法中的所有测试结果都是 true，则通过测试；反之，有任何一个断言是 false，则测试不通过。

Jasmine 使用 `expect` 取实际值 ，它与 Matcher 函数链接，Matcher 函数带有期望值。

Matcher 函数实现实际值和期望值之间的布尔比较。它负责向 Jasmine 报告断言结果。

- 任何的 Matcher 在调用方法之前，都可以使用 not 来"装饰"，实现否定断言

```javascript
  it("and can have a negative case", function() {
    expect(false).not.toBe(true);
  });
```

用例中出现 `error` 或使用函数 `fail`  会导致用例直接失败。

##### Setup and Teardown

为了使每一个测试用例，都可以重复的执行 setup 与 teardown 代码，Jasmine 提供了全局的方法：

- beforeEach 方法会在每一个测试用例执行前运行
- afterEach 方法在每个测试用例执行后被调用

我们可以在全局的 describe 代码块中定义全局变量，而将变量的初始化代码放在 beforeEach 方法里，并在 afterEach 方法中重置变量。

##### 跳过代码块和指定代码块

- Suites 和 Specs 分别可以用 `xdescribe` 和` xit` 方法跳过它们；
- Suites 和 Specs 也可以用 `fdescribe` 和 `fit` 指定哪些是需要执行的，再编写用例时使用。

还有更多的高级用法，参看 Jasmine 官方文档。

#### Protractor API 简介

e2e 测试离不开浏览器和页面元素，protranctor 封装了四类 API 来操作：

- browser 操控浏览器。例： `browser.get('https://angularjs.org/')`
- locators 定位元素。例： `const loc = by.css('.pet .cat')`
- element 取得元素。例： `const cat = element(loc)`
- ExpectedConditions 期望达到某个条件。例： `browser.wait(ExpectedConditions.visibilityOf(cat), 5000);`

## 测试用例编写

### 目录结构

为了保证测试代码简洁、可维护性，我们将代码分为三个目录 cases、pages、locators 分别存放用例、页面对象类、元素定位类。	

在测试用例中引入 PageObject 模拟用户操作和断言（expect）。

```javascript
// cases
describe('book flight ticket', () => {
  let cases: FlightCase[]
  let searchPage: SearchPage
  let displayPage: DisplayPage

  beforeEach(() => {
    searchPage = new SearchPage()
    displayPage = new DisplayPage()
    cases = searchPage.getCases<FlightCase>('FlightCase')
  })

  it('display flight page', () => {
    searchPage.open()
    // expect(page.getCardHeadText()).toEqual('国内机票')
  })
  it('book one-way ticket ', () => {
    const data = cases[0]
    searchPage
      .selectIsOneWay(data.isOneWayBool)
      .enterDepartureDate(data.departureDate)
      .selectDepartureCity(data.departureCity)
      .selectArrivalCity(data.arrivalCity)
      .selectIsEconomyClass(data.isEconomyClassBool)
      .search()

    expect(browser.getCurrentUrl())
      .toContain(displayPage.url)
      .then(displayPage.getLogger('url is right'))
    displayPage.comps.loading.wait()
    // 单程，往返
    expect(displayPage.one_way.getText())
      .toContain(data.oneWayText)
      .then(displayPage.getLogger('one_way is: ', data.oneWayText))
})

```

在 PageObject 中引入 Locator，定义页面的属性和行为，不必关心元素来源自何方。

```javascript
// pages
export class SearchPage extends AppPage {
  private flightSearchLoc = new FlightSearchLoc()

  one_way = element(this.flightSearchLoc.ONE_WAY)
  round_trip = element(this.flightSearchLoc.ROUND_TRIP)

	selectIsOneWay(isSingle = true) {
    const radio = isSingle ? this.one_way : this.round_trip
    radio.click().then(this.getLogger('clickIsOneWay: ', isSingle))
    return this
  }
  enterDepartureDate(value: string) {
    this.departure_date.click()
    this.comps.calendar.select(value)
    return this
  }
}
// locators

export class FlightSearchLoc {
  SELF = by.css(tagname)
  // 单程
  ONE_WAY = by.css(`[formcontrolname='isOneWay']>label:nth-child(1)`)
  // 往返
  ROUND_TRIP = by.css(`[formcontrolname='isOneWay']>label:nth-child(2)`)
  // 出发日期
  DEPARTURE_DATE = by.css(
    `[formcontrolname=flightDate] input.ant-calendar-picker-input`,
  )
  // 公务舱
  BUSINESS_CLASS = by.css('[formcontrolname=bunkType] label[nzvalue=C]')
  // 搜索按钮
  SEARCH_FLIGHT_BTN = by.xpath(
    `//${tagname}//button[contains(string(), '搜索')]`,
  )
}

```

最终的目录结构如下：

```code
|-- e2e
    |-- src
        |-- cases
        |   |-- flight.e2e-spec.ts
        |-- locators
        |   |-- flight
        |   |   |-- display.loc.ts
        |   |   |-- search.loc.ts
        |-- pages
            |-- flight
            |   |-- search.po.ts        
```

### 代码编写

#### Locators

常用到 API 有 `by.css()`、` by.xpath()`

- `by.css` == `document.querySelectorAll`
- 我们定义的组件会保留在 dom 中，我们可以基于组件来定位元素：`by.css('search-flight-form')`
- `FormControl` 会保留 `formcontrolname` 属性在元素上：`by.css([formcontrolname=returnDate] input.ant-calendar-picker-input)`
- `by.xpath` 常用于 css 不方便取到的元素，例如 button：`by.xpath(//${tagname}//button[contains(string(), '搜索')] )`

xpath 编写时，可以下载 chrome 插件 [ChroPath](https://chrome.google.com/webstore/detail/chropath/ljngjbnaijcbncmcnjfhigebomdlkcjo) 来验证是否编写正确。

#### Pages

pages 中有一些基础类：  `AppPage` 和 components 目录下定义的 pages

-  `AppPage` 中定义了通用的页面行为比如：打开浏览器链接、登录等。其他页面继承 `AppPage`，实现这些方法的复用。
- components 内的pages 定义了 nz-zorro 封装的组件行为：等待 loading、selector 选取等等

一个 Locator 对应一个 Page，封装了一个 cli 命令  `the2e --loc locfilename` 生成对应的 Page。

定义页面行为时，

⚠️注意事项：输入框清空的方法 `clear()` 清除不了内存中保存的值，请使用 `customClear()`。

#### cases

每个 Suites 、 Specs 之间相互独立，某个断言失败，不会影响下一个断言。

测试用例数据使用 xlsx 文件保存在 data 目录：

```code
|-- e2e
    |-- data                                 # 数据存放目录
    |   |-- models.ts                        # 数据声明文件
    |   |-- xlsx                             # 数据源
    |       |-- login.xlsx
```

在 xlsx 文件中，定义测试数据以及测试数据模型：

- 数据模型

  - 数据模型名称，由文件名（首字母大写）+ （Sheet名（非默认）） + Case，如：`login.xlsx` => `LoginCase`
  - 数据模型字段取 Sheet 中第一行
  - 数据类型
  - 更新 models.ts

- 数据

  - 数据的获取方式，使用 AppPage 中的 getCases<T>('T') 方法。例：`searchPage.getCases<FlightCase>('FlightCase')`

  - 数据分组

    

### debugger

node 版本需要 <8.0，建议使用 nvm。 在使用调试的地方执行 ` brower.pause()`。 



## 测试报告

其他浏览器支持

https://www.seleniumhq.org/projects/webdriver/

## 移动端支持

[http://www.protractortest.org/#/mobile-setup](http://www.protractortest.org/#/mobile-setup)

## 持续集成

## 相关文档

[Jasmine](https://jasmine.github.io/)

[protractor](http://www.protractortest.org/#/)





