<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <router-link to="/workflows" class="text-gray-400 hover:text-gray-600 transition-colors">
        &larr; 返回列表
      </router-link>
      <h1 class="text-2xl font-bold">执行详情 #{{ id }}</h1>
    </div>

    <div v-if="loading" class="text-center py-10 text-gray-400">加载中...</div>

    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded text-red-700">
      {{ error }}
    </div>

    <div v-else-if="execution" class="space-y-6">
      <div class="bg-white rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-4">基本信息</h2>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          <div>
            <dt class="text-sm text-gray-500">工作流类型</dt>
            <dd class="font-medium">{{ typeLabel(execution.workflow_type) }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">触发来源</dt>
            <dd class="font-medium">{{ execution.trigger_source }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">状态</dt>
            <dd>
              <span
                class="inline-block px-2.5 py-0.5 rounded-full text-sm font-medium"
                :class="statusBadge[execution.status] ?? 'bg-gray-100 text-gray-600'"
              >
                {{ statusLabel[execution.status] ?? execution.status }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Plane Issue ID</dt>
            <dd class="font-medium">{{ execution.plane_issue_id ?? "-" }}</dd>
          </div>
          <div v-if="execution.input_path">
            <dt class="text-sm text-gray-500">输入路径</dt>
            <dd class="font-mono text-sm">{{ execution.input_path }}</dd>
          </div>
        </dl>
      </div>

      <div class="bg-white rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-4">时间线</h2>
        <dl class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <div>
            <dt class="text-sm text-gray-500">创建时间</dt>
            <dd class="font-medium">{{ execution.created_at }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">开始时间</dt>
            <dd class="font-medium">{{ execution.started_at ?? "-" }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">完成时间</dt>
            <dd class="font-medium">{{ execution.completed_at ?? "-" }}</dd>
          </div>
        </dl>
      </div>

      <div v-if="execution.error_message" class="bg-white rounded-lg p-6 border-l-4 border-red-500">
        <h2 class="text-lg font-semibold mb-3 text-red-700">错误信息</h2>
        <pre class="bg-red-50 p-4 rounded text-sm text-red-800 whitespace-pre-wrap overflow-auto">{{
          execution.error_message
        }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { fetchExecution, type ExecutionDetail } from "@/api/workflow";
import { typeLabel } from "@/utils/workflow";

const route = useRoute();
const id = Number(route.params.id);
const execution = ref<ExecutionDetail | null>(null);
const loading = ref(true);
const error = ref("");

const statusBadge: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  running: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  pending: "等待中",
  running: "运行中",
  success: "成功",
  failed: "失败",
};

onMounted(async () => {
  try {
    execution.value = await fetchExecution(id);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "加载失败";
  } finally {
    loading.value = false;
  }
});
</script>
