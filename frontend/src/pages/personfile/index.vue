<template>
  <calendar-heatmap
    end-date="2018-10-22"
    :values="[{ date: '2018-9-22', count: 6 }]"
  ></calendar-heatmap>
</template>
<script setup lang="ts">
import { calendarDark } from 'naive-ui/es/calendar/styles'
import Vue from 'vue'
import { CalendarHeatmap } from 'vue3-calendar-heatmap'
</script>

<style scoped></style>
