<template>
  <NLayout has-sider>
    <n-config-provider :theme="theme">
      <NLayoutSider content-style="padding: 12px;" :width="200" style="height: calc(100%)">
        <NMenu :options="menuOptions" :value="getMenu()" />
        <NMenu
          :options="userMenuOptions"
          :value="''"
          style="bottom: 0; position: absolute; width: 100%"
        />
      </NLayoutSider>
    </n-config-provider>

    <NLayoutContent has-sider>
      <n-config-provider :theme="theme" style="width: 100%">
        <NLayout
          style="height: calc(100% - 64px)"
          content-style="padding: 24px; "
          :native-scrollbar="false"
        >
          <slot></slot>
        </NLayout>

        <NLayoutFooter bordered position="absolute" style="height: 64px; padding: 24px">
          ❤️ 由东华大学第9组创建 ❤️
        </NLayoutFooter>
      </n-config-provider>
    </NLayoutContent>
  </NLayout>
</template>

<script setup lang="tsx">
import {
  NLayout,
  NLayoutContent,
  NLayoutFooter,
  NLayoutSider,
  type MenuOption,
  NMenu,
  NSwitch,
  darkTheme,
  NConfigProvider,
  type GlobalTheme
} from 'naive-ui'
import { ref } from 'vue'
const route = useRoute()
const router = useRouter()

function getMenu() {
  return route.path.split('/', 2)[1] || 'homepage'
}

const menuOptions: MenuOption[] = [
  {
    key: 'homepage',
    label: () => <RouterLink to={{ path: '/' }}>首页</RouterLink>
  },
  {
    key: 'category',
    label: () => <RouterLink to={{ path: '/category' }}>分类列表</RouterLink>
  },
  {
    key: 'contest',
    label: () => <RouterLink to={{ path: '/contest' }}>比赛列表</RouterLink>
  }
]
function getNickname() {
  const nickname = window.localStorage.getItem('nickname')
  return nickname
}

const handleLogout = async () => {
  localStorage.removeItem('userid')
  localStorage.removeItem('username')
  localStorage.removeItem('nickname')
  localStorage.removeItem('token')
  apiUserLogout()
  console.log(router)
  router.go(0)
}

const theme = ref<GlobalTheme | null>(null)

function ChangeTheme() {
  theme.value = theme.value === null ? darkTheme : null
}

const userMenuOptions: MenuOption[] = [
  {
    key: 'change_theme',
    label: () => (
      <NSwitch size="large" onUpdate:value={ChangeTheme}>
        切换主题
      </NSwitch>
    )
  },
  {
    key: 'login',
    label: () => <RouterLink to={{ path: '/login' }}>{getNickname() ?? '<未登录>'}</RouterLink>
  },
  {
    key: 'logout',
    disabled: localStorage.getItem('nickname') == null,
    label: () => (
      <a style="color: red" onClick={handleLogout}>
        退出登录
      </a>
    )
  }
]
</script>

<script lang="tsx">
import { apiUserLogout } from '@/api/user'

import { RouterLink, useRoute, useRouter } from 'vue-router'
</script>
