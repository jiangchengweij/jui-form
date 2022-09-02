<template>
  <view class="jui-img-upload">
    <view class="header">
      <text class="file-title">{{ title }}</text>
      <text class="file-count">{{ uploadfiles.length }}/{{ limitLength }}</text>
    </view>
    <view class="container">
      <view 
        v-for="(item, index) in uploadfiles"
        :key="index"
        class="box"
      >
        <view class="box-content">
          <image
            class="file-image"
            :src="item.url"
            mode="aspectFill">
          </image>
          <view v-if="delIcon" class="icon-del-box" @click.stop="delFile(index)">
            <view class="icon-del"></view>
            <view class="icon-del rotate"></view>
          </view>
          <view
            v-if="(item.progress && item.progress !== 100)"
            class="progress"
          >
            <progress 
              class="progress-item"
              :percent="item.progress === -1 ? 0 : item.progress"
              stroke-width="4"
              :backgroundColor="item.errMsg?'#ff5a5f':'#EBEBEB'"
            >
            </progress>
          </view>
          <view v-if="item.errMsg" class="mask" @click.stop="uploadFiles(item, index)">
            点击重试
          </view>
        </view>
      </view>
      <view v-if="uploadfiles.length < limit" class="box">
        <view class="box-content is-add" @click="onChoose">
          <slot>
          	<view class="icon-add"></view>
          	<view class="icon-add rotate"></view>
          </slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { ref, computed, watch, toRaw } from 'vue';
  import {
  	get_file_ext,
  	get_extname,
  	get_files_and_is_max,
  	get_file_info,
  	get_file_data
  } from './util.js';
  import {
  	chooseAndUploadFile,
  	uploadCloudFiles
  } from './choose-and-upload-file.js';
  export default {
    emits: ['uploadFiles', 'choose', 'delete', 'update:modelValue'],
    props: {
      modelValue: {
        type: [Array, String],
        default: '',
      },
      title: {
        type: String,
        default: '',
      },
      disabled: {
      	type: Boolean,
      	default: false
      },
      disablePreview: {
      	type: Boolean,
      	default: false
      },
      // 自动上传
      autoUpload: {
      	type: Boolean,
      	default: true
      },
      // 最大选择个数 ，h5只能限制单选或是多选
      limit: {
      	type: [Number, String],
      	default: 9
      },
      returnType: {
      	type: String,
      	default: 'array'
      },
      imageStyles: {
      	type: Object,
      	default () {
      		return {
      			width: 'auto',
      			height: 'auto'
      		}
      	}
      },
      sizeType: {
      	type: Array,
      	default () {
      		return ['original', 'compressed']
      	}
      },
      // 选择文件类型  image/video/all
      fileMediatype: {
      	type: String,
      	default: 'image'
      },
      fileExtname: {
      	type: [Array, String],
      	default () {
      		return []
      	}
      },
      delIcon: {
      	type: Boolean,
      	default: true
      },
    },
    setup(props, { emit }) {
      
      const uploadfiles = ref([]);
      
      const noSpace = false;
      
      if (!(uniCloud.config && uniCloud.config.provider)) {
      	noSpace = true
      	uniCloud.chooseAndUploadFile = chooseAndUploadFile
      }
      
      const limitLength = computed(() => {
        const { limit } = props;
        if (!limit) {
          return 1;
        }
        if (limit >= 9) {
          return 9
        }
        return limit;
      })
      
      function prviewImage(img, index) {
        let urls = [];
      }
      
      watch(() => props.modelValue, (newValue) => {
        setValue(newValue);
      }, {
        immediate: true,
      })
      
      //删除文件
      function delFile(index) {
        emit('delete', {
					tempFile: uploadfiles.value[index],
					tempFilePath: uploadfiles.value[index].url
				})
        uploadfiles.value.splice(index, 1);
        setEmit();
      }
      
      //选择文件
      function onChoose() {
        const { disabled } = props;
        if(disabled) return;
        chooseFiles();
      }
      
      function chooseFiles() {
        const _extname = get_extname(props.fileExtname);
        const { fileMediatype, sizeType } = props;
        //获取后缀
        uniCloud.chooseAndUploadFile({
          type: fileMediatype,
          compressed: false,
          sizeType: sizeType,
          extension: _extname.length > 0 ? _extname : undefined,
          count: limitLength.value - uploadfiles.value.length, //默认9
          onChooseFile: chooseFileCallback,
          onUploadProgress: progressEvent => {
          	setProgress(progressEvent, progressEvent.index)
          }
        }).then(result => {
          setSuccessAndError(result.tempFiles);
        })
        .catch(err => {
          console.log('选择失败', err);
        })
      }
      
      async function chooseFileCallback(res) {
        const { fileExtname, disablePreview, disabled, autoUpload, fileMediatype } = props;
        const _extname = get_extname(fileExtname);
        const is_one = limitLength.value === 1 &&
        		disablePreview && !disabled
        // 如果这有一个文件 ，需要清空本地缓存数据
        if (is_one) {
        	uploadfiles.value = []
        }
        let {
          filePaths,
          files
        } = get_files_and_is_max(res, _extname);
        if (!(_extname && _extname.length)) {
          filePaths = res.tempFilePaths;
          files = res.tempFiles
        }
        
        let currentData = []
        for (let i = 0; i < files.length; i++) {
        	if (limitLength.value - uploadfiles.value.length <= 0) break
        	files[i].uuid = Date.now()
        	let filedata = await get_file_data(files[i], fileMediatype)
        	filedata.progress = 0
        	filedata.status = 'ready'
        	uploadfiles.value.push(filedata)
        	currentData.push({
        		...filedata,
        		file: files[i]
        	})
        }
        emit('select', {
        	tempFiles: currentData,
        	tempFilePaths: filePaths
        })
        res.tempFiles = files;
        // 停止自动上传
        // if (!autoUpload) {
        // 	res.tempFiles = []
        // }
      }
      
      /**
       * 批传
       * @param {Object} res
       * @param {Object} fn
       */
      function uploadFiles(files) {
      	files = [].concat(files)
      	uploadCloudFiles.call(this, files, 5, res => {
      			this.setProgress(res, res.index, true)
      		})
      		.then(result => {
      			this.setSuccessAndError(result)
      		})
      		.catch(err => {
      			console.log(err)
      		})
      }
      
      /**
       * 成功或失败
       */
      async function setSuccessAndError(res, fn) {
        let successData = [];
        let errorData = [];
        let tempFilePath = [];
        let errorTempFilePath = [];
        for (let i = 0; i < res.length; i++) {
          const item = res[i];
          const index = item.uuid ? uploadfiles.value.findIndex(p => p.uuid === item.uuid) : item.index;
          if (index === -1 || !uploadfiles.value) break;
          
          if (item.errMsg === 'request:fail') {
            uploadfiles.value[index].url = item.path;
            uploadfiles.value[index].status = 'error';
            uploadfiles.value[index].errMsg = item.errMsg;
            errorData.push(uploadfiles.value[index])
            errorTempFilePath.push(uploadfiles.value[index].url)
          } else {
            uploadfiles.value[index].errMsg = '';
            uploadfiles.value[index].fileID = item.url;
            const reg = /cloud:\/\/([\w.]+\/?)\S*/;
            if (reg.test(item.url)) {
            	uploadfiles.value[index].url = await getTempFileURL(item.url)
            } else{
            	uploadfiles.value[index].url = item.url
            }
            uploadfiles.value[index].status = 'success';
            uploadfiles.value[index].progress += 1;
            successData.push(uploadfiles.value[index]);
            tempFilePath.push(uploadfiles.value[index].fileID);
          }
        }
        
        if (successData.length > 0) {
          setEmit()
        }
        
        if (errorData.length > 0) {
          emit('fail', {
						tempFiles: backObject(errorData),
						tempFilePaths: errorTempFilePath
					})
        }
      }
      
      //设置新的值
      async function setValue(imgValue) {
        const { returnType } = props;
        const newData = [];
				const getData = async (v) => {
					const reg = /cloud:\/\/([\w.]+\/?)\S*/
					let url = '';
          if(typeof v === 'string') {
            v = { url: v };
          } else {
            if(v.fileID){
            	url = v.fileID;
            } else {
            	url = v.url;
            }
          }
          if (reg.test(url)) {
          	v.fileID = url;
          	v.url = await getTempFileURL(url);
          }
          if(v.url) v.path = v.url;
					return v;
				}
        if (returnType === 'string') {
          if(imgValue !== '') {
            let tempValue = imgValue.split(',')
            for(let i=0;i < tempValue.length;i++) {
              const tempData = await getData(tempValue[i]);
              newData.push(tempData);
            }
          }
        } else {
          if(Array.isArray(imgValue)) {
            for(let i=0;i < imgValue.length;i++) {
              const tempData = await getData(imgValue[i]);
              newData.push(tempData);
            }
          }
        }
        uploadfiles.value = newData;
      }
      
      /**
       * 获取进度
       * @param {Object} progressEvent
       * @param {Object} index
       * @param {Object} type
       */
      function setProgress(progressEvent, index, type) {
        const fileLenth = uploadfiles.length;
        const percentNum = (index / fileLenth) * 100;
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        let idx = index;
        if (!type) {
        	idx = uploadfiles.value.findIndex(p => p.uuid === progressEvent.tempFile.uuid)
        }
        if (idx === -1 || !uploadfiles.value[idx]) return;
        uploadfiles.value[idx].progress = percentCompleted - 1;
        emit('progress', {
          index: idx,
          progress: parseInt(percentCompleted),
          tempFile: uploadfiles[idx]
        })
      }
      
      async function getTempFileURL(fileList) {
      	fileList = {
      		fileList: [].concat(fileList)
      	}
      	const urls = await uniCloud.getTempFileURL(fileList)
      	return urls.fileList[0].tempFileURL || '';
      }
      
      
      /**
       * 处理返回事件
       */
      function setEmit() {
        let data = [];
        let localValue = null;
        let { returnType } = props;
        if ( returnType === 'string' ) {
          uploadfiles.value.forEach((file) => {
            data.push(file.url);
          })
          localValue = data.join(',');
        } else { //默认用数组的形式放回
          data = backObject(uploadfiles.value);
          localValue = [...data];
        }
        emit('update:modelValue', localValue)
      }
      
      function backObject(files) {
        let newFilesData = [];
        files.forEach(v => {
          newFilesData.push({
            extname: v.extname,
            fileType: v.fileType,
            image: v.image,
            name: v.name,
            path: v.path,
            size: v.size,
            fileID:v.fileID,
            url: v.url
          })
        })
        return newFilesData;
      }
      
      return {
        prviewImage,
        uploadfiles,
        limitLength,
        onChoose,
        delFile,
      }
    }
  }
</script>

<style lang="scss" scoped>
  .container {
    /* #ifndef APP-NVUE */
    display: flex;
    box-sizing: border-box;
    /* #endif */
    flex-wrap: wrap;
    margin: 0 -5px;
    .box {
      position: relative;
      // flex: 0 0 33.3%;
      width: 33.3%;
      height: 0;
      padding-top: 33.33%;
      /* #ifndef APP-NVUE */
      box-sizing: border-box;
      /* #endif */
      .box-content {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        margin: 5px;
        border: 1px #eee solid;
        border-radius: 5px;
        overflow: hidden;
        .progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          /* border: 1px red solid; */
          z-index: 2;
          .progress-item {
            width: 100%;
          }
        }
        .mask: {
          /* #ifndef APP-NVUE */
          display: flex;
          /* #endif */
          justify-content: center;
          align-items: center;
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          left: 0;
          color: #fff;
          font-size: 12px;
          background-color: rgba(0, 0, 0, 0.4);
        }
      }
    }
  }
  .file-image {
  	width: 100%;
  	height: 100%;
  }
  .rotate {
  	position: absolute;
  	transform: rotate(90deg);
  }
  .is-add {
  	/* #ifndef APP-NVUE */
  	display: flex;
  	/* #endif */
  	align-items: center;
  	justify-content: center;
  }
  .icon-del-box {
  	/* #ifndef APP-NVUE */
  	display: flex;
  	/* #endif */
  	align-items: center;
  	justify-content: center;
  	position: absolute;
  	top: 3px;
  	right: 3px;
  	height: 26px;
  	width: 26px;
  	border-radius: 50%;
  	background-color: rgba(0, 0, 0, 0.5);
  	z-index: 2;
  	transform: rotate(-45deg);
  }
  .icon-add {
  	width: 50px;
  	height: 5px;
  	background-color: #f1f1f1;
  	border-radius: 2px;
  }
  .icon-del {
  	width: 15px;
  	height: 2px;
  	background-color: #fff;
  	border-radius: 2px;
  }
</style>