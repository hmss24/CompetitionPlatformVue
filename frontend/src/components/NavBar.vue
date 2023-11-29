<template>
  <NLayout has-sider>
    <NLayoutSider content-style="padding: 12px;" :width="200" style="height: calc(100%)">
      <NMenu :options="menuOptions" :value="getMenu()" />
      <NMenu
        :options="userMenuOptions"
        :value="''"
        style="bottom: 0; position: absolute; width: 100%"
      />
    </NLayoutSider> 
    <NLayoutContent>
      <div style="padding: 16px">
        <slot></slot>
      </div>
      <NLayoutFooter bordered position="absoulute" style="height: 64px; padding: 24px">
        ❤️ 由东华大学第9组创建 ❤️
      </NLayoutFooter>
    </NLayoutContent>
  </NLayout>
</template>

<script lang="ts">
import {
  NLayout,
  NLayoutContent,
  NLayoutFooter,
  NLayoutSider,
  type MenuOption,
  NMenu,
NMessageProvider
} from 'naive-ui'
import { defineComponent, h } from 'vue'
import { RouterLink, useRoute, type Router } from 'vue-router'

const menuOptions: MenuOption[] = [
  {
    key: 'homepage',
    label: () => h(RouterLink, { to: { path: '/' } }, { default: () => '首页' })
  },
  {
    key: 'category',
    label: () => h(RouterLink, { to: { path: '/category' } }, { default: () => '分类列表' })
  },
  {
    key: 'contest',
    label: () => h(RouterLink, { to: { path: '/contest' } }, { default: () => '比赛列表' })
  }
]
function getNickname() {
  const nickname = window.localStorage.getItem('nickname')
  return nickname
}

const userMenuOptions: MenuOption[] = [
  {
    key: 'change_theme',
    label: () => h('a', {}, '切换主题')
  },
  {
    key: 'login',
    label: () =>  h(RouterLink,{to : {path : '/login'}} , {default: () => getNickname() ?? '<未登录>'})
  },
  {
    key: 'logout',
    label: () => h('a', { style: 'color: red' }, '退出登录')
  }
]

const userLoginedOptions = [
  {
    label: '个人信息',
    key: 'personal'
  },
  {
    label: '退出登录',
    key: 'logout'
  }
]
const userUnloginedOptions: any[] = []

function handleUserSelect(key: string | number) {
  console.log(key)
}

export default defineComponent({
  components: {
    NLayout,
    NLayoutContent,
    NLayoutFooter,
    NLayoutSider,
    NMenu,
},
  setup() {
    const route = useRoute()
    function getMenu() {
      return route.path.split('/', 2)[1] || 'homepage'
    }
    function getUserOptions() {
      return getNickname() != null ? userLoginedOptions : userUnloginedOptions
    }
    return {
      menuOptions,
      getMenu,
      getUserOptions,
      handleUserSelect,
      getNickname,
      userMenuOptions
    }
  }
})
</script>

<style scoped></style>
