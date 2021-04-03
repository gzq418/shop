<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-alert
        show-icon
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedCate"
            :options="cateList"
            :props="cateProp"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addParamsDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag -->
                <el-tag
                  closable
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"  @close="handleclose(i,scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="editFormDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addParamsDialogVisible = true"
            >添加属性</el-button
          >
          <el-table :data="anyTableData" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i" @close="handleclose(i,scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="editFormDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addParamsDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑参数的对话框 ctr+d直接修改add为edit-->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="editParamsDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cateList: [],
      cateProp: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 被选中的商品分类的数组
      selectedCate: [],
      //被激活的页签名称
      activeName: "many",
      manyTableData: [],
      anyTableData: [],
      addParamsDialogVisible: false,
      //   添加表单的数据对象
      addForm: {
        attr_name: "",
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: "参数不能为空", trigger: "blur" },
        ],
      },
    // //   控制按钮与文本框的切换显示
    //   inputVisible:false,
    // //   文本框输入的内容
    // inputValue:'',
      editParamsDialogVisible: false,
      // 修改表单的数据对象
      editForm: {},
      //   修改表单的验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: "参数不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        this.$message.error("获取商品列表失败");
      }
      this.cateList = res.data;
    },
    // 选中的项改变时触发的函数
    async handleChange() {
      this.getParamsData();
    },
    async getParamsData() {
      if (this.selectedCate.length !== 3) {
        this.selectedCate = [];
        this.manyTableData=[]
        this.anyTableData=[]
        return;
      }
      //根据所选分类的id和当前所属的面板获取对应的数据
      console.log(this.selectedCate);
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败");
      }
      //将属性下的字符串分割成数组
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        //控制文本框的显示与隐藏
        item.inputVisible=false
        // 文本框的输入值
        item.inputValue=''
      });
      console.log(res.data);
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.anyTableData = res.data;
      }
    },
    //tab页签点击事件的处理函数
    handleTabClick() {
      this.getParamsData();
    },
    // 监听添加参数的对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加属性
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加属性失败");
        }
        this.$message.success("添加属性成功");
        this.addParamsDialogVisible = false;
        this.getParamsData();
      });
    },
    // 点击修改表单按钮，弹出对话框
    async editFormDialog(attr_id) {
      const {
        data: res,
      } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        { attr_sel: this.titleText }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数信息失败");
      }
      this.editForm = res.data;
      this.editParamsDialogVisible = true;
    },
    //监听修改对话框的关闭，重置表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //修改属性并保存
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 200) {
          this.$message.error("修改属性失败");
        }
        this.editParamsDialogVisible = false;
        this.getParamsData();
      });
    },
    // 根据id删除属性的操作
    async removeParams(attr_id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该属性, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除操作");
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除属性失败");
      }
      this.$message.success("删除属性成功");
      this.getParamsData();
    },
    //文本框失去焦点或者摁下了enter键都会触发的函数
  async  handleInputConfirm(row){
        if(row.inputValue.trim().length===0){
          row.inputValue=''
          row.inputVisible=false
          return
        }
        // 说明文本框输入的内容有效
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue=''
        row.inputVisible=false
        this.saveAttrVals(row)
      
    },
    // 点击按钮触发的函数
    showInput(row){
        row.inputVisible=true
        // 让文本框自动获得焦点
        // nextTick当页面上元素被重新渲染之后，才会指定回调函数中的代码
        // 当页面上元素被重新渲染，再让文本框获得焦点
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },
    //将对attr_vals的操作保存到数据库
  async  saveAttrVals(row){
          // 需要发起请求，保存这次操作
       const {data:res}=await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
       {attr_name:row.attr_name,attr_sel:row.attr_sel,attr_vals:row.attr_vals.join(' ')})
       if(res.meta.status!==200){
           this.$message.error('修改参数失败')
       }
       this.$message.success('修改参数成功')
    },
    //删除对应的参数可选项
    handleclose(i,row){
        row.attr_vals.splice(i,1)
        this.saveAttrVals(row)
        
    }
  },
  computed: {
    //如果按钮需要被禁用，则返回true，否则，返回false
    isBtnDisabled() {
      if (this.selectedCate.length !== 3) {
        return true;
      }
      return false;
    },
    //选中的分类的id
    cateId() {
      if (this.selectedCate.length === 3) {
        return this.selectedCate[2];
      }
      return null;
    },
    //添加属性的对话框的文本标题
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    },
    
  },
};
</script>
<style lang="less" scoped>
.cat_opt {
  margin-top: 15px;
}
.el-tag {
  margin-left: 10px;
}
.input-new-tag{
    width: 120px;
}
</style>