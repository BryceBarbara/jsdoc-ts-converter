<template>
  <main flex flex-col h-100vh>
    <div grow h-full overflow-y-hidden>
      <slot />
    </div>
    <div>
      <Footer />
      <div class="mt-5 mx-auto text-center opacity-25 text-sm">
        [Full Layout]
      </div>
    </div>
  </main>
</template>
