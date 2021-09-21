<template>
  <div class="containers">
    <div
      class="canvas"
      ref="canvas"
    ></div>
    <div
      id="js-properties-panel"
      class="panel"
    ></div>
    <ul class="buttons">
      <li>
        <a
          href="javascript:"
          ref="saveDiagram"
          title="保存为bpmn"
        >保存为bpmn</a>
      </li>
      <li>
        <a
          ref="saveSvg"
          href="javascript:"
          title="保存为svg"
        >保存为svg</a>
      </li>
      <li>
        <el-upload
          class="upload"
          ref="upload"
          accept=".bpmn"
          action=""
          :show-file-list='false'
          :multiple='false'
          :file-list="fileList"
          :on-change="fileChange"
          :auto-upload="false"
        >
          <el-button
            slot="trigger"
            size="small"
            type="primary"
          >选取文件</el-button>
        </el-upload>
      </li>
    </ul>
  </div>
</template>

<script>
// 引入相关的依赖
import BpmnModeler from 'bpmn-js/lib/Modeler'

// activiti
import propertiesProviderModule from '@/components/properties-panel/provider/activiti'

// 导入汉化包
import customTranslate from '@/components/customTranslate/customTranslate'
import activitiModdleDescriptor from '@/assets/activiti.json'

// 导入属性面板
import propertiesPanelModule from 'bpmn-js-properties-panel'

// camunda
// import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'
// import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'

export default {
  name: 'Basic',
  components: {},
  // 生命周期 - 创建完成（可以访问当前this实例）
  created () { },
  // 生命周期 - 载入后, Vue 实例挂载到实际的 DOM 操作完成，一般在该过程进行 Ajax 交互
  mounted () {
    this.init()
  },
  data () {
    return {
      // bpmn建模器
      bpmnModeler: null,
      container: null,
      canvas: null,
      fileList: [],
      file: null,
      xmlStr: null
    }
  },
  methods: {
    fileChange (file, fileList) {
      const that = this
      this.file = file.raw
      const reader = new FileReader()
      reader.readAsText(this.file)
      reader.onload = (e) => {
        that.xmlStr = reader.result
        that.createNewDiagram()
      }
    },
    init () {
      // 添加翻译组件
      var customTranslateModule = {
        translate: ['value', customTranslate]
      }
      // 获取到属性ref为“canvas”的dom节点
      const canvas = this.$refs.canvas

      // 建模
      this.bpmnModeler = new BpmnModeler({
        container: canvas,
        // 添加控制板
        propertiesPanel: {
          parent: '#js-properties-panel'
        },
        additionalModules: [
          // 右边的属性栏
          propertiesProviderModule,
          propertiesPanelModule,
          customTranslateModule
        ],
        moddleExtensions: {
          // camunda的
          // camunda: camundaModdleDescriptor,
          // activiti
          activiti: activitiModdleDescriptor
        }
      })
      this.createNewDiagram()
    },
    createNewDiagram () {
      if (this.xmlStr == null) {
        this.xmlStr = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                    <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:activiti="http://activiti.org/bpmn" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" xmlns:tns="http://www.activiti.org/test" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" expressionLanguage="http://www.w3.org/1999/XPath" id="m1632196428500" name="" targetNamespace="http://www.activiti.org/test" typeLanguage="http://www.w3.org/2001/XMLSchema">
                      <process id="myProcess_1" isClosed="false" isExecutable="true" processType="None">
                        <startEvent id="_2"/>
                      </process>
                      <bpmndi:BPMNDiagram documentation="background=#FFFFFF;count=1;horizontalcount=1;orientation=0;width=842.4;height=1195.2;imageableWidth=832.4;imageableHeight=1185.2;imageableX=5.0;imageableY=5.0" id="Diagram-_1" name="New Diagram">
                        <bpmndi:BPMNPlane bpmnElement="myProcess_1">
                          <bpmndi:BPMNShape bpmnElement="_2" id="Shape-_2">
                            <omgdc:Bounds height="32.0" width="32.0" x="170.0" y="105.0"/>
                            <bpmndi:BPMNLabel>
                              <omgdc:Bounds height="32.0" width="32.0" x="0.0" y="0.0"/>
                            </bpmndi:BPMNLabel>
                          </bpmndi:BPMNShape>
                        </bpmndi:BPMNPlane>
                      </bpmndi:BPMNDiagram>
                    </definitions>
                    `
      }
      // 将字符串转换成图显示出来
      this.bpmnModeler.importXML(this.xmlStr, (err) => {
        if (err) {
          // console.error(err)
        } else {
          // 这里是成功之后的回调, 可以在这里做一系列事情
          this.success()
        }
      })
    },
    success () {
      this.addBpmnListener()
      this.addModelerListener()
    },
    addBpmnListener () {
      const that = this
      // 获取a标签dom节点
      const downloadLink = this.$refs.saveDiagram
      const downloadSvgLink = this.$refs.saveSvg
      // 给图绑定事件，当图有发生改变就会触发这个事件
      this.bpmnModeler.on('commandStack.changed', function () {
        that.saveSVG(function (err, svg) {
          that.setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg)
        })
        that.saveDiagram(function (err, xml) {
          that.setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml)
        })
      })
    },
    // 下载为SVG格式,done是个函数，调用的时候传入的
    saveSVG (done) {
      // 把传入的done再传给bpmn原型的saveSVG函数调用
      this.bpmnModeler.saveSVG(done)
    },
    // 下载为bpmn格式,done是个函数，调用的时候传入的
    saveDiagram (done) {
      // 把传入的done再传给bpmn原型的saveXML函数调用
      this.bpmnModeler.saveXML({ format: true }, function (err, xml) {
        done(err, xml)
      })
    },
    // 当图发生改变的时候会调用这个函数，这个data就是图的xml
    setEncoded (link, name, data) {
      // 把xml转换为URI，下载要用到的
      const encodedData = encodeURIComponent(data)
      // 下载图的具体操作,改变a的属性，className令a标签可点击，href令能下载，download是下载的文件的名字
      console.log(link, name, data)
      const xmlFile = new File([data], 'test.bpmn')
      console.log(xmlFile)
      if (data) {
        link.className = 'active'
        link.href = 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData
        link.download = name
      }
    }
  }
}
</script>

<style scoped>
.containers {
  position: absolute;
  background-color: #ffffff;
  width: 100%;
  height: 100%;
}
.canvas {
  width: 100%;
  height: 100%;
}
.panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 300px;
}
.buttons {
  position: absolute;
  left: 20px;
  bottom: 20px;
}
.buttons li {
  display: inline-block;
  margin: 5px;
}
.buttons li a {
  color: #999;
  background: #eee;
  cursor: not-allowed;
  padding: 8px;
  border: 1px solid #ccc;
  text-decoration: none;
}
.buttons li a.active,
.buttons .upload {
  color: #333;
  background: #fff;
  cursor: pointer;
}
</style>
