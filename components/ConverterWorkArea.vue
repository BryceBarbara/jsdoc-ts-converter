<script setup lang="ts">
import { TheTool } from '~~/code/conversion/thing'

const templates: Record<string, string> = {
  typedef: `/**
 * @typedef ReportObject Contains information on a report that may be requested.
 * @property {string[]} fields
 * @property {string} reportName
 * @property {string} reportType - Indicates the type of report you are requesting.
 * @property {string} dateRangeType The date range your report should encompass.
 * @property {Date} [startDate]
 * @property {Date} [endDate]
 * @property {ReportDownloadFormat} format
 * @property {ReportObjectAdditionalHeaders} [additionalHeaders]
 * @property {ReportFilter[]} [filters]
 */`,
  typedefEnum: '/** @typedef {\'Strawberry\'|\'Grape\'|\'Peach\'} GoodFruit Some of the best fruits. */',
  typedefImport: `/** @typedef {import("bull").Job} Job */
/** @typedef {import("handlebars").TemplateDelegate} HandlebarsTemplateDelegate */
/** @typedef {import("./tasks/task-queue")} TaskQueue */`,
  constructor: `class AdwordsAccount {
  /**
   * Creates a new instance of \`AdwordsAccount\`.
   *
   * @param {string} cid - The Google Ads account ID.
   * @param {object} [clientInfo] - Custom credentials to use when authenticating.
   */
  constructor(cid, clientInfo = null) {}
}`,
  func: `class Blah {
  /**
   * Gets the \`GoogleAdsCustomer\` info for the provided Google Ads account.
   *
   * @param {string} [clientCustomerId] - The Google Ads account ID of the account to get info on.
   * @returns {Promise<GoogleAdsCustomer[]>}
   */
  getCustomers(clientCustomerId) {
      return null;
  }
}`,
}

const templateOptions = ref([
  {
    label: '@typedef',
    value: 'typedef',
  },
  {
    label: '@typedef Enum',
    value: 'typedefEnum',
  },
  {
    label: '@typedef Import',
    value: 'typedefImport',
  },
  {
    label: 'constructor',
    value: 'constructor',
  },
  {
    label: 'function',
    value: 'func',
  },
])

const sourceInputText = useStorage<string | undefined>('sourceInput', '')
const selectedTemplate = ref<string | null>(null)

const outputText = computed(() => {
  if (!sourceInputText.value)
    return ''
  const result = TheTool.parseInput(sourceInputText.value)
  let output = '';
  [
    ...result.importStatements,
    ...result.interfaces,
    ...result.typeStatements,
    ...result.functions,
  ].forEach((v, idx, arr) => {
    output += `${v}`
    if (idx !== arr.length - 1)
      output += '\n\n'
  })
  return output
})

onMounted(() => {
  const sourceInput = sourceInputText.value
  if (!sourceInput) {
    if (selectedTemplate.value)
      selectedTemplate.value = 'typedef'
  }
  else {
    // determine if the source code is from a template and select it if it is
    const matchingTemplate = Object.keys(templates).find(k => sourceInput === templates[k])
    if (matchingTemplate)
      selectedTemplate.value = matchingTemplate
  }
})

watch(sourceInputText, (newVal) => {
  // if there's no template selected, don't do anything
  if (!selectedTemplate.value)
    return
  const templateText = templates[selectedTemplate.value]
  const wasTemplateModified = sourceInputText.value && templateText !== sourceInputText.value
  if (wasTemplateModified)
    selectedTemplate.value = null
})

watch(selectedTemplate, (newVal, oldVal) => {
  const oldTemplateText = oldVal ? templates[oldVal] : undefined
  const wasTemplateModified = sourceInputText.value && oldTemplateText !== sourceInputText.value
  // do nothing if nothing changed (happens upon startup)
  if (!newVal && !oldVal)
    return
  // If the template was modified, we don't want to overwrite the user's changes.
  if (oldVal && wasTemplateModified)
    return
  // if no template was selected
  if (!newVal)
    sourceInputText.value = ''
  else
    sourceInputText.value = templates[newVal] || undefined
}, { immediate: true })
</script>

<template>
  <div class="converter-work-area" flex h-full overflow-hidden px-1>
    <div class="area left-area default-border">
      <div flex class="default-border" b-b-1>
        <label for="template-select" font-bold p-2>Template</label>
        <Dropdown id="template-select" v-model="selectedTemplate" :options="templateOptions" name="template-select" />
      </div>
      <ClientOnly>
        <EditorInput id="inputTx" v-model="sourceInputText" name="inputTx" h-full w-full />
      </ClientOnly>
    </div>
    <div class="middle-area" px-2 grow-0 shrink flex flex-col items-center justify-center gap-5>
      <span flex flex-col items-center>
        <i i-mdi:arrow-left />
        <p>Input</p>
      </span>
      <span flex flex-col items-center>
        <i i-mdi:arrow-right />
        <p>Output</p>
      </span>
    </div>
    <div class="area right-area default-border">
      <ClientOnly>
        <CodeHightlight class="output-tx" h-full w-full :model-value="outputText" />
      </ClientOnly>
    </div>
  </div>
</template>

<style lang="scss">
.converter-work-area {
  --at-apply: text-dark dark:text-gray:80;
  .default-border {
    --at-apply: dark:border-dark-100 border-gray-300;
  }
  .area {
    --at-apply: h-full overflow-hidden flex-1 border-1;
  }
  .left-area {
    --at-apply: flex flex-col;
  }
}
</style>
