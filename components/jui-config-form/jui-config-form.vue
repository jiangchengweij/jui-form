<template>
  <jui-form-item
    :label="item.label"
    :labelWidth="labelWidth"
    :name="item.field"
    :required="item.required"
    :suffixText="item.suffixText ? item.suffixText : ''"
    :labelPosition="item.labelPosition"
    :errMsg="formErrMsg[item.field] ? formErrMsg[item.field].errorMessage : ''"
  >
    <jui-input
      v-if="item.component === 'input'"
      :name="item.field"
      :type="item.itemProps['type'] ? item.itemProps['type'] : 'text'"
      :modelValue="formData[item.field]"
      @update:modelValue="onItemUpdateValue(item.field, $event)"
      :maxlength="item.itemProps['maxlength'] ? item.itemProps['maxlength'] : 140"
      :placeholder="item.itemProps['placeholder'] ? item.itemProps['placeholder'] : item.label"
      :placeholderStyle="item.itemProps['placeholderStyle']"
      :clearable="item.itemProps['clearable'] ? item.itemProps['clearable'] : true"
      :prefixIcon="item.itemProps['prefixIcon'] ? item.itemProps['prefixIcon'] : ''"
      :border="item.itemProps['border'] ? item.itemProps['border'] : false"
      :disabled="item.itemProps['disabled'] ? item.itemProps['disabled'] : false"
      :clearSize="item.itemProps['clearSize'] ? item.itemProps['clearSize'] : 18"
      :styles="item.itemProps['styles'] ? item.itemProps['styles'] : {color: '#333',disableColor: '#F7F6F6',borderColor: '#e5e5e5'}"
    />
    <jui-check-list v-else-if="item.component === 'checklist'"
      :modelValue="formData[item.field]"
      @update:modelValue="onItemUpdateValue(item.field, $event)"
      :multiple="!!item.itemProps['multiple']"
      :options="item.itemProps['options'] ? item.itemProps['options'] : []"
      :mode="item.itemProps['mode'] ? item.itemProps['mode'] : 'default'"
      :wrap="item.itemProps['wrap'] ? item.itemProps['wrap'] : false"
      :map="item.itemProps['map'] ? item.itemProps['map'] : { text: 'text', value:'value' }"
      :selectedColor="item.itemProps['selectedColor'] ? item.itemProps['selectedColor'] : ''"
      :selectedTextColor="item.itemProps['selectedTextColor'] ? item.itemProps['selectedTextColor'] : ''"
    >
    </jui-check-list>
    <jui-switch
      v-else-if="item.component === 'switch'"
      :modelValue="formData[item.field]"
      @update:modelValue="onItemUpdateValue(item.field, $event)"
      :disabled="item.itemProps['disabled'] ? item.itemProps['disabled'] : false"
      :type="item.itemProps['type'] ? item.itemProps['type'] : 'switch'"
      :color="item.itemProps['color']"
    >
    </jui-switch>
    <jui-img-upload
      v-else-if="item.component === 'img-upload'"
      :modelValue="formData[item.field]"
      @update:modelValue="onItemUpdateValue(item.field, $event)"
      :disabled="item.itemProps['disabled'] ? item.itemProps['disabled'] : false"
      :disablePreview="item.itemProps['disablePreview'] ? item.itemProps['disablePreview'] : false"
      :limit="item.itemProps['limit'] ? item.itemProps['limit'] : 9"
    >
    </jui-img-upload>
   <jui-picker
      v-else-if="item.component === 'picker'"
      :modelValue="formData[item.field]"
      @update:modelValue="onItemUpdateValue(item.field, $event)"
      :disabled="item.itemProps['disabled'] ? item.itemProps['disabled'] : false"
      :mode="item.itemProps['mode'] ? item.itemProps['mode'] : 'selector'"
      :range="item.itemProps['range'] ? item.itemProps['range'] : []"
      :rangeKey="item.itemProps['rangeKey'] ? item.itemProps['rangeKey'] : ''"
      :placeholder="item.itemProps['placeholder'] ? item.itemProps['placeholder'] : ''"
    >
    </jui-picker>
    <jui-selector
      v-else-if="item.component === 'selector'"
      :modelValue="formData[item.field]"
      :multiple="!!item.itemProps['multiple']"
      @update:modelValue="onItemUpdateValue(item.field, $event)"
      :mode="item.itemProps['mode'] ? item.itemProps['mode'] : 'normal'"
      :disabled="item.itemProps['disabled'] ? item.itemProps['disabled'] : false"
      :options="item.itemProps['options'] ? item.itemProps['options'] : []"
      :map="item.itemProps['map'] ? item.itemProps['map'] : { text: 'text', value:'value' }"
      :placeholder="item.itemProps['placeholder'] ? item.itemProps['placeholder'] : ''"
      :selectTitle="item.itemProps['selectTitle'] ? item.itemProps['selectTitle'] : '选择' + item.label"
    >
    </jui-selector>
    <jui-date-picker
      v-else-if="item.component === 'date'"
      :modelValue="formData[item.field]"
      @update:modelValue="onItemUpdateValue(item.field, $event)"
      :disabled="item.itemProps['disabled'] ? item.itemProps['disabled'] : false"
      :placeholder="item.itemProps['placeholder'] ? item.itemProps['placeholder'] : ''"
      :startPlaceholder="item.itemProps['placeholder'] ? item.itemProps['placeholder'] : ''"
      :endPlaceholder="item.itemProps['placeholder'] ? item.itemProps['placeholder'] : ''"
      :rangeSeparator="item.itemProps['rangeSeparator'] ? item.itemProps['rangeSeparator'] : ''"
    >
    </jui-date-picker>
    <jui-address
      v-else-if="item.component == 'address'"
      v-model="formData[item.field]"
      :modelValue="formData[item.field]"
      @update:modelValue="onItemUpdateValue(item.field, $event)"
    >
    </jui-address>
  </jui-form-item>
</template>

<script>
  export default {
    props: {
      item: {
        type: Object,
        required: true,
      },
      formData: {
        type: Object,
        required: true,
      },
      onItemUpdateValue: {
        type: Function,
        required: true,
      },
      formErrMsg: {
        type: Object,
        required: true,
      },
      labelWidth: {
        type: String,
        default: '160rpx',
      }
    }
  }
</script>

<style>
</style>