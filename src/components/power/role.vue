<template>
    <div>
        <!-- 面包屑导航 -->
         <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
          <el-row>
              <el-col>
                  <el-button type="primary">添加角色</el-button>
              </el-col>
          </el-row>
          <el-table :data='roleList' border stripe>
              <!-- 展开列 -->
              <el-table-column type="expand">
                  <template slot-scope="scope">
                      <el-row :class="['bdbottom',i1===0 ? 'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                        <!-- 渲染一级权限 -->
                        <el-col :span="5">
                            <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <!-- 渲染二级权限和三级权限 -->
                        <el-col :span="19">
                            <el-row :class="[i2===0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                <el-col :span="6">
                                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)" >{{item2.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <el-col :span="18">
                                    <el-tag  type="warning" closable @close="removeRightById(scope.row,item3.id)" v-for="(item3) in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                                </el-col>
                            </el-row>
                        </el-col>
                      </el-row>
                     <!-- <pre>{{scope.row}}</pre>  -->
                  </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column label="角色名称" prop="roleName"></el-table-column>
              <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
              <el-table-column label="操作" width="300px">
                  <template slot-scope="scope">
                      <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRoleDialog(scope.row)">编辑</el-button>
                      <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                      <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">权限分配</el-button>
                  </template>
              </el-table-column>
          </el-table>
      </el-card>
      <!-- 编辑角色的对话框 -->
      <el-dialog
  title="角色编辑"
  :visible.sync="editRoleDialogVisible"
  width="50%"
  >
  <span>这是一段信息</span>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editRole(id)">确 定</el-button>
  </span>
</el-dialog>

      <!-- 设置用户权限的对话框 -->
      <el-dialog
  title="用户权限设置"
  :visible.sync="setRightDialogVisible"
  width="50%" @close="setRightDialogClosed"
  >
 <el-tree :data="rightList" :props="TreeProps" ref="treeRef" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys"	></el-tree>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary"  @click="allotRight">确 定</el-button>
  </span>
</el-dialog>

    </div>
</template>
<script>
export default {
    data(){
        return {
            roleList:[],
            setRightDialogVisible:false,
            editRoleDialogVisible:false,
            rightList:[],
            TreeProps:{
                children:'children',
                label:'authName'
            },
            //默认选中的节点的id数组
            defKeys:[],
            //当前即将分配角色的id
            roleId:''
        }
    },
    created(){
        this.getRoleList()
    },
    methods:{
        //获取角色列表
      async  getRoleList(){
           const {data:res}=await this.$http.get('roles')
           if(res.meta.status!==200){
               return this.$message.error('获取角色列表失败')
           }
           this.roleList=res.data
           console.log(this.roleList)
        },
        //编辑角色的对话框
        editRoleDialog(id){

        },
        editRole(){

        },
        // 根据id删除权限
       async removeRightById(role,right){
         const confirmResult =await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if(confirmResult!=='confirm'){
            return this.$message.info('已取消删除')
        }
        const {data:res}=await this.$http.delete(`roles/${role.id}/rights/${right}`)
        if(res.meta.status!==200){
            this.$message.error('删除用户权限失败')
        }
        // this.getRoleList()
        role.children=res.data
        },
        // 展示分配权限的对话框
        async showSetRightDialog(role){
            this.roleId=role.id
         const {data:res}=  await this.$http.get('rights/tree')
         if(res.meta.status!==200){
             return this.$message.error('获取权限失败')
         }
         this.rightList=res.data
         //递归获取三级权限的id
        this.getReafId(role,this.defKeys)
            this.setRightDialogVisible=true
        },
        //通过递归获取用户的三级权限的id
        getReafId(node,arr){
            //如果当前node不包含children属性，则是三级节点
            if(!node.children){
                return arr.push(node.id)
            }
            node.children.forEach(item => 
            this.getReafId(item,arr));

        },
        //关闭对话框清空默认选中的节点的id数组
        setRightDialogClosed(){
            this.defKeys=[]
        },
       async allotRight(){
            const keys=[
                // ...是展开运算符
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            const idStr=keys.join(',')
          const {data:res}=await  this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
          if(res.meta.status!==200){
              this.$message.error('分配权限失败')                                                                                                                                                                                                                                                                                                                               
          }
          this.$message.success('分配权限成功')
          this.getRoleList()
          this.setRightDialogVisible=false
        }
    }
};
</script>
<style lang="less" scoped>
.el-tag{
    margin: 7px;
}
.bdtop{
    border-top: 1px solid #eee;

}
.bdbottom{
    border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>