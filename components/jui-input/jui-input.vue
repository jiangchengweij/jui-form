<template>
  <view class="jui-input">
    <view
      class="content"
      :class="{
        'is-input-border':border,
        'is-textarea':type==='textarea',
        'is-disabled':disabled
      }"
    >
      <textarea
        v-if="type === 'textarea'"
        class="content-textarea"
        :class="{'input-padding':border}"
        :placeholder="placeholder"
        :placeholderStyle="placeholderStyle"
        placeholder-class="placeholder-class"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput"
        @confirm="onConfirm"
      ></textarea>
      <input 
        v-else
        :type="type === 'password' ? 'text' : type"
        class="content-input"
        :style="{
         'padding-right':type === 'password' ||clearable || prefixIcon?'':'10px',
        }"
        :name="name"
        :value="state.val"
        :password="!state.showPassword && type === 'password'"
        :placeholder="placeholder"
        :placeholderStyle="placeholderStyle"
        placeholder-class="placeholder-class"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput"
        @confirm="onConfirm"
      />
      <template v-if="type === 'password' && passwordIcon">
        <uni-icons 
          v-if="state.val"
          class="content-clear-icon"
          :class="{'is-textarea-icon':type==='textarea'}"
          type="showPassword?'eye-slash-filled':'eye-filled'"
          :size="18"
          color="#c0c4cc"
          @click="onEyes"
        >
        </uni-icons>
      </template>
      <template v-else-if="suffixIcon">
        <uni-icons 
          v-if="suffixIcon"
          class="content-clear-icon"
          :type="suffixIcon"
          color="#c0c4cc"
          @click="onClickIcon('suffix')">
        </uni-icons>
      </template>
      <template v-else>
        <uni-icons 
          v-if="clearable && state.val && !disabled" 
          class="content-clear-icon"
          :class="{'is-textarea-icon':type==='textarea'}"
          type="clear"
          :size="clearSize"
          color="#c0c4cc" 
          @click="onClear">
        </uni-icons>
      </template>
      <slot name="right"></slot>
    </view>
  </view>
</template>
<script>
  import { reactive, watch, computed } from 'vue';
  export default {
    emits:['click','iconClick','update:modelValue','input','focus','blur','confirm'],
    props: {
      type: {
        type: String,
        default: 'text'
      },
      modelValue: [Number, String],
      trim: {
      	type: [Boolean, String],
      	default: true
      },
      maxlength: {
      	type: [Number, String],
      	default: 140
      },
      placeholder: String,
      placeholderStyle: String,
      clearable: {
      	type: Boolean,
      	default: true
      },
      prefixIcon: {
      	type: String,
      	default: ''
      },
      border: {
      	type: Boolean,
      	default: false
      },
      suffixIcon: {
      	type: String,
      	default: ''
      },
      name: {
        type: String,
        default: ''
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      clearSize: {
      	type: [Number, String],
      	default: 18
      },
      styles: {
      	type: Object,
      	default () {
      		return {
      			color: '#333',
      			disableColor: '#F7F6F6',
      			borderColor: '#e5e5e5'
      		}
      	}
      },
    },
    setup(props, { emit }) {

      const state = reactive({
        focused: false,
        val: '',
        isFirstBorder: false,
        showClearIcon: false,
        showPassword: false
      });
      
      watch(()=> props.modelValue, (newVal) => {
        state.val = newVal
      }, {
        immediate: true,
      })
      
      const inputMaxlength = computed(() => {
        return Number(props.maxlength);
      })
      
      function onEyes() {
        state.showPassword = !state.showPassword;
      }
      
      function onInput(event) {
        let value = event.detail.value;
        const { trim } = props;
        if (trim) {
          if (trim === true) {
            value = trimStr(value);
          } else if(typeof(trim) === 'string') {
            value = trimStr(value, trim);
          }
        }
        state.val = value;
        emit('update:modelValue',value)
      }
      
      function onFocus(event) {
        emit('focus', event)
      }
      
      function onBlur(event) {
        emit('blur', event)
      }
      
      function onConfirm(e) {
        emit('confirm', e.detail.value)
      }
      
      function onClear(event) {
      	state.val = '';
      	emit('update:modelValue','')
      }
      
      function fieldClick() {
      	emit('click');
      }
      
      function onClickIcon(type) {
      	emit('iconClick', type)
      }
      
      function trimStr(str, pos = 'both') {
        if (pos === 'both') {
        	return str.trim();
        } else if (pos === 'left') {
        	return str.trimLeft();
        } else if (pos === 'right') {
        	return str.trimRight();
        } else if (pos === 'start') {
        	return str.trimStart()
        } else if (pos === 'end') {
        	return str.trimEnd()
        } else if (pos === 'all') {
        	return str.replace(/\s+/g, '');
        } else if (pos === 'none') {
        	return str;
        }
        return str;
      }
      
      return {
        state,
        onEyes,
        onInput,
        onFocus,
        onBlur,
        onConfirm,
        fieldClick,
        onClickIcon,
        onClear
      }
    }
  }
</script>
<style lang="scss" scoped>
  $uni-error: #e43d33;
  $uni-border-1: #DCDFE6 !default;
  .jui-input {
  	/* #ifndef APP-NVUE */
  	width: 100%;
  	/* #endif */
  	flex: 1;
  	position: relative;
  	text-align: left;
  	color: #333;
  	font-size: 14px;
  }
  
  .content {
  	flex: 1;
  	/* #ifndef APP-NVUE */
  	width: 100%;
  	display: flex;
  	box-sizing: border-box;
  	// min-height: 36px;
  	/* #endif */
  	flex-direction: row;
  	align-items: center;
  }
  
  .content-input {
  	/* #ifndef APP-NVUE */
  	width: auto;
  	/* #endif */
  	position: relative;
  	overflow: hidden;
  	flex: 1;
  	line-height: 1;
  	font-size: 14px;
  }
  
  .placeholder-class {
  	color: #999;
  	font-size: 12px;
  	font-weight: 200;
  }
  
  .is-textarea {
  	align-items: flex-start;
  }
  
  .is-textarea-icon {
  	margin-top: 5px;
  }
  
  .content-textarea {
  	position: relative;
  	overflow: hidden;
  	flex: 1;
  	line-height: 1.5;
  	font-size: 14px;
  	padding-top: 6px;
  	padding-bottom: 10px;
  	height: 80px;
  	/* #ifndef APP-NVUE */
  	min-height: 80px;
  	width: auto;
  	/* #endif */
  }
  
  .input-padding {
  	padding-left: 10px;
  }
  
  .content-clear-icon {
  	padding: 0 5px;
  }
  
  .label-icon {
  	margin-right: 5px;
  	margin-top: -1px;
  }
  
  .is-input-border {
  	/* #ifndef APP-NVUE */
  	display: flex;
  	box-sizing: border-box;
  	/* #endif */
  	flex-direction: row;
  	align-items: center;
  	border: 1px solid $uni-border-1;
  	border-radius: 4px;
  }
  
  .uni-error-message {
  	position: absolute;
  	bottom: -17px;
  	left: 0;
  	line-height: 12px;
  	color: $uni-error;
  	font-size: 12px;
  	text-align: left;
  }
    
  .is-input-error-border {
  	border-color: $uni-error;
  	.placeholder-class {
  		color: mix(#fff, $uni-error, 50%);;
  	}
  }
  
  .is-first-border {
  	/* #ifndef APP-NVUE */
  	border: none;
  	/* #endif */
  	/* #ifdef APP-NVUE */
  	border-width: 0;
  	/* #endif */
  }
  
  .is-disabled {
  	border-color: red;
  	background-color: #F7F6F6;
  	color: #D5D5D5;
  	.uni-easyinput__placeholder-class {
  		color: #D5D5D5;
  		font-size: 12px;
  	}
  }
</style>