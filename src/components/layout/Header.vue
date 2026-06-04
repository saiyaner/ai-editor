<template>
  <header class="header">
    <div class="logo">
      AI Editor
    </div>

    <div class="actions">
      <button>Settings</button>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 50px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 16px;

  border-bottom: 1px solid #333;
}

.logo {
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>