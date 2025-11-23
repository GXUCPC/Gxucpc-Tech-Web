<script setup lang="ts">
import FooterContent from '@/components/FotterBar.vue'
import HeaderNav from '@/components/HeaderBar.vue'
import { ref } from 'vue'
import { useDialog } from '@/store/globalLoading.ts'
const { dialogVisible} = useDialog()
const loginData = ref({
  usename: '',
  password: '',
});
const login = () => { //这里是登录逻辑
    dialogVisible.value = false;

}
</script>

<template>

  <el-dialog
    v-model="dialogVisible"
    width="40%"
    style="text-align: center;">
    <template #header>
        <div style="font-size: 30px; text-align: left; margin-top: 20px; margin-left: 30px;">
            用户登录
        </div>
    </template>
    <el-form :model="loginData" label-width="50px">
        <el-form-item label="账号" style="margin-bottom: 30px; margin-top: 30px;">
            <el-input v-model="loginData.usename" size="large" placeholder="请输入账号" />
        </el-form-item>

        <el-form-item label="密码" style="margin-bottom: 20px; margin-top: 50px;">
            <el-input v-model="loginData.password" size="large" type="password" placeholder="请输入密码" />
        </el-form-item>

    </el-form>
    <el-button size="large" @click.prevent="login" text style="font-size: 30px; margin: 20px;">登录</el-button>
</el-dialog>
  <header-nav />
  <div class="contentContainer">
    <div class="content">
      <router-view />
    </div>
  </div>
  <footer-content />
</template>

<style scoped>
.contentContainer {
  width: 100%;
}

.content {
  margin: 0 auto;
  width: min(100%, 1920px);
  min-height: calc(100vh - 4em);
}
</style>
