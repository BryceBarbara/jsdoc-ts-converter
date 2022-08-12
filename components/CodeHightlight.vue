<script setup lang="ts">
import Prism from 'prismjs'
import 'prismjs/plugins/toolbar/prism-toolbar'
import 'prismjs/plugins/line-numbers/prism-line-numbers'

import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard'
import 'prismjs/components/prism-typescript'

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined,
  },
})

Prism.manual = true
const codeEl = ref<HTMLElement>()

onMounted(() => {
  updateHighlight()
})

function updateHighlight() {
  if (!codeEl.value)
    return
  // const html = Prism.highlight(props.modelValue ?? '', Prism.languages.typescript, 'typescript')
  // console.log(html)
  Prism.highlightElement(codeEl.value)
}

watch(() => props.modelValue, () => {
  nextTick(updateHighlight)
})
</script>

<template>
  <div grid class="highlight">
    <pre class="line-numbers language-typescript"><code ref="codeEl" class="language-typescript">{{ props.modelValue }}</code></pre>
  </div>
</template>

<style lang="scss">
// @use 'prismjs/themes/prism-solarizedlight.css';
.highlight {
  @import 'prismjs/plugins/toolbar/prism-toolbar';
  @import 'prismjs/plugins/line-numbers/prism-line-numbers';
    --at-apply: text-gray-400 dark:bg-dark-800 overflow-auto;
    user-select: contain;
  .code-toolbar {
    --at-apply: overflow-y-auto;
    &>.toolbar {
      --at-apply: right-2em;
    }
  }
  pre {
    --at-apply: h-full important-bg-transparent important-py-0 important-my-0;
  }
}
HTML:not(.dark) {
  @import 'prismjs/themes/prism';
}
HTML.dark {
  @import 'prismjs/themes/prism-tomorrow';
  // .token.comment {
  //     --at-apply: text-green-600;
  // }
  // .token.keyword {
  //     --at-apply: text-blue;
  // }
  // .token.class-name, .token.builtin {
  //     --at-apply: text-green-300;
  // }
  // .token.operator, .token.punctuation {
  //     --at-apply: text-gray-100;
  // }
}
</style>
