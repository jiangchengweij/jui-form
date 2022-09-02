<template>
  <view class="jui-switch">
    <switch 
      :checked="checked"
      :type="type"
      @change="onChange"
      :color="color"
      :style="{
        transform: 'scale(0.7)'
      }"
    />
  </view>
</template>

<script>
  import { watch, ref } from 'vue';
  export default {
    emits: ['update:modelValue', 'change'],
    props: {
      modelValue: [String, Number, Boolean],
      disabled: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        default: 'switch',
      },
      color: {
        type: String,
        default: '#FFCC33'
      },
      returnType: {
        type: String,
        default: 'boolean',
      }
    },
    setup(props, { emit }) {
      const checked = ref(false);

      watch(() => props.modelValue, (newValue) => {
        if(typeof newValue === 'boolean') {
          checked.value = newValue;
        } else {
          checked.value = (!!newValue) ? true : false;
        }
      }, {
        immediate: true,
      })
      
      function onChange(event) {
        const { returnType } = props;
        let tempVal = event.detail.value;
        if(returnType === 'number') {
          tempVal = event.detail.value ? 0 : 1;
        } else if(returnType === 'string') {
          tempVal = event.detail.value ? '0' : '1';
        }
        emit('change', event);
        emit('update:modelValue', tempVal);
      }
      
      return {
        checked,
        onChange
      }
    }
  }
</script>

<style>
  .jui-switch {
    display: flex;
  }
</style>