### 一个强大的自定义表单系统，基本可以解决企业业务中90%的表单提交
#### 持续更新中，力图解决100%的表单业务

对于一些erp,mes这样的系统，重复的开发表单是个非常繁琐的事情，其中涉及非常多的重复劳动。正是如此，
这个开源表单系统旨在为大家提供一款基本完全靠配置就可以生成自己所需要的表单页面，其中包括验证和一些交互的配置。

#### jui-form

| props | 类型    | 是否必填 | 说明 |
| ----- | -------- | ----- | ----- |
| modelValue | Object | 否 | 表单域的值 |
| schemas    | Array | 是 | 配置所需要的表单shemas, 核心配置 |
| labelWidth | Number, String | 否 | 标签项的宽度 |
| validateConfig | Object | 否 | 表单验证的一些配置 |

##### 事件
| event | 参数 |触发条件 |
| ----- | ------ | ----- |
| submit | { error: array, formModel: Object } | 表单提交触发 |
| reset | null | 表单重置是触发 |
| changeItem | { name: String, value: any, formModel: Object } | 表单某一项值改变是触发 |

##### 可使用方法

- setValue(name: String, value: any): 设置某个表单项目的值
- setShow(name: Array | String): 设置显示某些表单项
- setHide(name: Array | String): 设置隐藏某些表单项

##### schema

| props | 类型    | 是否必填 | 说明 |
| ----- | -------- | ----- | ----- |
| label | String | 否 | 表单的label |
| field | String | 是 | 表单的所对应字段 |
| component | String | 是 | 表达的类型,如input, checklist |
| defaultValue | any | 否 | 默认的值 |
| hide | Boolean | 否 | 是否隐藏 |
| itemProps | Boolean | 否 | 对应表单的配置属性 |

...文档持续完善中
 