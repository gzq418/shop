<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片信息区 -->
    <el-card>
      <!-- 信息提示区 -->
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        center
        :closable="false"
      >
      </el-alert>
      <!-- 进度条区 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="`left`" :before-leave="beforeTabsChange" @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name" ></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
               <el-cascader
    :options="cateList"
    :props="cateProp"
    @change="handleChange" v-model="addForm.goods_cat" ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
              <el-form-item :label="item.attr_name" v-for="(item) in manyTable" :key="item.attr_id" >
                  <el-checkbox-group v-model="item.attr_vals" >
    <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
    
  </el-checkbox-group>
              </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
              <el-form-item :label="item.attr_name" v-for="(item) in onlyTable" :key="item.attr_id">
                  <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
              <!-- action 图片要上传到后台API的地址 -->
              <el-upload
  :action="uploadURL"
  :on-preview="handlePreview"
  :on-remove="handleRemove"
  list-type="picture" :headers="headersOBJ" :on-success="handleSuccess">
  <el-button size="small" type="primary">点击上传</el-button>
</el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
              <quill-editor v-model="addForm.goods_introduce"></quill-editor>
              <el-button type="primary" class="btnadd" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog
  title="图片预览"
  :visible.sync="previewVisible"
  width="50%"
  >
 <img :src="previewURL" class="previewPic">
</el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: "0",
      // 添加商品的数据对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品分类数组
        goods_cat:[],
        //商品的照片
        pics:[],
        //商品的详情介绍
        goods_introduce:'',
        attrs:[]
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat:[
            {required:true,message:"请选择商品分类",trigger:'blur'}
        ]      
      },
    //   动态参数数组
      manyTable:[],
    //   静态属性数组
      onlyTable:[],
      uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
    //   预览图片的URL
    previewURL:'',
    previewVisible:false,
      cateList:[],
      cateProp:{
          expandTrigger: 'hover',
          value:'cat_id',
          label:'cat_name',
      },
    //   图片上传组件的header头请求对象
      headersOBJ:{
          Authorization:window.sessionStorage.getItem('token')
      }
    };
  },
  created() {
      this.getCateList()
  },
  methods: {
     async getCateList(){
         const {data:res}=await this.$http.get('categories')
         if(res.meta.status!==200){
            return this.$message.error('获取商品分类失败')
         }
         this.cateList=res.data
      
      },
      handleChange(){
        //   控制只能选择三级分类
          if(this.addForm.goods_cat.length!==3){
             this.addForm.goods_cat=[]
          }
      },
    //   标签的切换触发的函数
      beforeTabsChange(activeName, oldActiveName){
          if(oldActiveName==='0'&&this.addForm.goods_cat.length!==3)
          {
              this.$message.error('请先选择商品分类')
              return false
          }      
      },
    //   点击tab标签的触发函数
    async  tabClicked(){
        //   访问的是动态参数面板
        if(this.activeIndex==='1'){
           const{data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,{
                params:{sel:'many'}
            })
            if(res.meta.status!==200)
            {
                this.$message.error('获取动态参数失败')
            }
           res.data.forEach(item => {
               item.attr_vals=item.attr_vals.length===0?[]:item.attr_vals.split(' ')
               
           });
            this.manyTable=res.data
        }
        if(this.activeIndex==='2'){
           const{data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,{
                params:{sel:'only'}
            })
            if(res.meta.status!==200)
            {
                this.$message.error('获取静态属性失败')
            }
            this.onlyTable=res.data
        }
      },
      //图片预览
      handlePreview(file){
          this.previewURL=file.response.data.url
          this.previewVisible=true

      },
    //   图片移除
      handleRemove(file){
        //   获取将要删除的图片的临时路径
        const filePath=file.response.data.tmp_path
        // 从pics数组中，找到这个图片对应的索引值
        const i=this.addForm.pics.findIndex(x=>x.pic===filePath)
        // 利用数组的splice方法，将图片信息对象从pics数组中移除
        this.addForm.pics.splice(i,1)
      },
    //  图片上传成功之后的操作，将图片在服务器的临时地址添加到添加表单的对象中
      handleSuccess(response){
        //   拼接得到一个图片的信息对象
        // 将图片信息对象push到pics数组中
        const picInfo={pic:response.data.tmp_path}
        this.addForm.pics.push(picInfo)

      },
      //添加商品
      addGoods()
      {
          this.$refs.addFormRef.validate(async valid=>{
              if(!valid){
                return  this.$message.error('请填写必要的表单项')
              }
              //lodash cloneDeep 深拷贝
              const form1= _.cloneDeep(this.addForm)
             form1.goods_cat= form1.goods_cat.join(",")
            //  处理动态参数
            this.manyTable.forEach(item =>{
                const newInfo={
                    attr_id:item.attr_id,
                    attr_value:item.attr_vals.join(' ')
                }
                this.addForm.attrs.push(newInfo)
            })
            //处理静态属性
            this.onlyTable.forEach(item=>{
                const newInfo={
                    attr_id:item.attr_id,
                    attr_value:item.attr_vals
                }
                this.addForm.attrs.push(newInfo)
            })
            form1.attrs=this.addForm.attrs
            console.log(form1)
            console.log(this.addForm)
           const {data:res}=await this.$http.post("goods",form1)
           console.log(res)
           if(res.meta.status!==201){
              return this.$message.error('添加商品失败')
           }
           this.$message.success('添加商品成功')
           this.$router.push('/goods')
          })
      }
  },
  computed:{
      cateId(){
          if(this.addForm.goods_cat.length===3){
              return this.addForm.goods_cat[2]
          }
          return null
      }
  }
};
</script>
<style lang="less" scoped>

.el-checkbox{
    margin: 0 10px 0 0 !important;
}
.previewPic{
    width: 100%;
}
.btnadd{
    margin-top: 15px;
}

</style>