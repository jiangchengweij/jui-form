<template>
	<view class="jui-form-group" :style="{ marginTop: `${top}px`, backgroundColor: backgroundColor }">
		<slot name="title">
			<view v-if="title" class="uni-group__title">
				<text class="uni-group__title-text">{{ title }}</text>
			</view>
		</slot>
		<view class="jui-group__content">
			<slot />
		</view>
	</view>
</template>

<script>
	/**
	 * Group 分组
	 * @description 表单字段分组
	 * @property {String} title 主标题
	 * @property {Number} top 分组间隔
	 * @property {Number} mode 模式
	 */
	export default {
		emits:['click'],
		props: {
			title: {
				type: String,
				default: ''
			},
			top: {
				type: [Number, String],
				default: 0
			},
      padding: {
        type: String,
        default: '15px'
      },
      backgroundColor: {
        type: String,
        default: '#fff'
      }
		},
	}
</script>
<style lang="scss" scoped>
  
	.jui-group {
		// border: 1px red solid;
	}

	.jui-group__title {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
		padding-left: 15px;
		height: 40px;
		background-color: #eee;
		font-weight: normal;
		color: #666;
	}

	.jui-group__content {
		padding: 0 30rpx;
	}

	.jui-group__title-text {
		font-size: 14px;
		color: #666;
	}

</style>
