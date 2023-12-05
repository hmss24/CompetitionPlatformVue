import { ref, watchEffect } from 'vue'
 
const LOCAL_THEME_KEY = '__theme__'
const theme = ref(localStorage.getItem(LOCAL_THEME_KEY) || 'light')
watchEffect(() => {
  //给body设置自定义属性theme，便于theme.css中识别不同主题颜色
  document.documentElement.dataset.theme = theme.value
 
  //设置本地缓存，便于刷新页面展示之前的主题
  localStorage.setItem(LOCAL_THEME_KEY, theme.value)
})
 
//导出全局主题变量，便于其他组件使用该变量
export const useTheme = () => ({
  theme,
})