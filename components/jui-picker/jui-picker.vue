<template>
  <view class="jui-picker">
    <picker 
      :mode="mode"
      :disabled="disabled"
      :range-key="rangeKey"
      :range="range"
      @change="onChange"
      @cancel="onCancel"
    >
      <view class="jui-input" :class="{ 'is-placeholder': !isEmpty }">
        <text v-if="isEmpty">{{ showText }}</text>
        <text v-else>{{ placeholder }}</text>
      </view>
    </picker>
  </view>
</template>

<script>
  import { watch, ref, computed } from 'vue';
  export default {
    emits: ['change', 'cancel', 'update:modelValue'],
    props: {
      mode: {
        type: String,
        default: 'selector'
      },
      modelValue: {
        type: [String, Number, Array],
        default: '',
      },
      range: {
        type: Array,
        default: []
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      rangeKey: {
        type: String,
        default: ''
      },
      placeholder: {
        type: String,
        default: ''
      },
      separator: {
        type: String,
        default: ','
      }
    },
    setup(props, { emit }) {
      
      const val = ref('');
      
      watch(() => props.modelValue, (newVal) => {
        const { mode } = props;
        if(mode === 'selector') {
          val.value = isNaN(newVal) ? -1 : parseInt(newVal);
        }
        val.value = newVal;
      }, {
        immediate: true,
      })
      
      const showText = computed(() => {
        const { mode, range, separator } = props;
        if(mode === 'selector') { //Number
          if(val.value !== -1 && val.value < range.length) {
            return range[val.value];
          }
        } else if (['region', 'multiSelector'].includes(mode)) {
          if(typeof val.value === 'array'){
            return val.value.join(props.separator ? props.separator : ',');
          }
        }
        return val.value;
      })
      
      const isEmpty = computed(() => {
        if(!val.value) {
          if(Array.isArray(val.value) && val.value.length === 0) {
            return true;
          }
          return false;
        }
        return true;
      })

      function onChange(event) {
        emit('change', event);
        emit('update:modelValue', event.detail.value);
      }
      
      function onCancel(event) {
        emit('cancel', event);
      }
      
      return {
        onChange,
        onCancel,
        showText,
        isEmpty
      }
    }
  }
</script>

<style lang="scss" scoped>
  .jui-input {
    &.is-placeholder {
      color: #808080;;
    }
  }
</style>