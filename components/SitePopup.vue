<template>
  <Teleport to="body">
    <Transition name="site-popup-fade">
      <div
        v-if="isVisible"
        class="site-popup"
        :class="{ 'site-popup--collapsed': isCollapsed }"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="popup.title ? titleId : undefined"
        :aria-label="popup.title ? undefined : 'Site notification'"
      >
        <div
          class="site-popup__panel"
          :class="{
            'site-popup__panel--visible': panelVisible,
            'site-popup__panel--collapsed': isCollapsed
          }"
        >
          <h2
            v-if="popup.title"
            :id="titleId"
            class="site-popup__title h4"
            :class="{ 'site-popup__title--expandable': isCollapsed }"
            @click="expandPopup"
          >
            {{ popup.title }}
          </h2>

          <button
            type="button"
            class="site-popup__close"
            aria-label="Close popup"
            @click="onCloseClick"
          >
            ×
          </button>

          <template v-if="!isCollapsed">
            <div v-if="popup.description?.length" class="site-popup__description rte">
              <SanityBlocks :blocks="popup.description" />
            </div>

            <button
              v-if="popup.buttonText"
              type="button"
              class="site-popup__button button"
              @click="collapsePopup"
            >
              {{ popup.buttonText }}
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useSiteSettings } from '~/composables/useSiteSettings'

const { sitePopup, pending: settingsPending } = useSiteSettings()
const isVisible = ref(false)
const panelVisible = ref(false)
const isCollapsed = ref(false)
const hasInitialized = ref(false)
const titleId = 'site-popup-title'

const popup = computed(() => sitePopup.value || {})

const storageKey = computed(() => {
  const disableAt = popup.value?.disableAt || 'no-expiry'
  return `site-popup-dismissed-${disableAt}`
})

const isExpired = () => {
  const disableAt = popup.value?.disableAt
  if (!disableAt) return false

  const disableDate = new Date(disableAt)
  return Number.isNaN(disableDate.getTime()) || Date.now() >= disableDate.getTime()
}

const shouldShowPopup = () => {
  const config = popup.value
  if (!config?.enabled) return false
  if (!config.description?.length) return false
  if (isExpired()) return false

  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(storageKey.value)
    if (stored === 'true') return false
  }

  return true
}

const collapsePopup = () => {
  isCollapsed.value = true

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey.value, 'collapsed')
  }
}

const fullyDismissPopup = () => {
  panelVisible.value = false
  isVisible.value = false

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey.value, 'true')
  }
}

const onCloseClick = () => {
  if (isCollapsed.value) {
    fullyDismissPopup()
  } else {
    collapsePopup()
  }
}

const expandPopup = () => {
  if (!isCollapsed.value) return
  isCollapsed.value = false

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(storageKey.value)
  }
}

const initPopup = async () => {
  if (settingsPending.value || hasInitialized.value) return

  hasInitialized.value = true
  if (!shouldShowPopup()) return

  const stored =
    typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey.value) : null

  isVisible.value = true
  isCollapsed.value = stored === 'collapsed'

  await nextTick()

  if (isCollapsed.value) {
    panelVisible.value = true
    return
  }

  requestAnimationFrame(() => {
    panelVisible.value = true
  })
}

watch([sitePopup, settingsPending], () => {
  initPopup()
}, { immediate: true })
</script>

<style scoped>
.site-popup {
  position: fixed;
  z-index: 9998;
  pointer-events: none;
}

.site-popup:not(.site-popup--collapsed) {
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: var(--wrapper-padding);
  padding-bottom: calc(var(--wrapper-padding) + env(safe-area-inset-bottom, 0px));
}

.site-popup--collapsed {
  bottom: 20px;
  left: 50%;
  transform: translate(-50%, -0%);
}

.site-popup__panel {
  position: relative;
  width: 100%;
  max-width: 36rem;
  padding: calc(var(--pad-2) + 0.5rem) var(--pad-2) var(--pad-2);
  background: var(--background-color);
  color: var(--text-color);
  border: 1px solid currentColor;
  pointer-events: auto;
  transform: translateY(110%);
  opacity: 0;
  transition:
    transform 0.55s cubic-bezier(0.34, 1.35, 0.64, 1),
    opacity 0.35s ease,
    max-width 0.4s ease,
    padding 0.4s ease;
}

.site-popup__panel--visible {
  transform: translateY(0);
  opacity: 1;
}

.site-popup__panel--collapsed {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: auto;
  max-width: min(90vw, 28rem);
  padding: 0.75rem 0.75rem 0.75rem 1.25rem;
  transform: translateY(0);
  opacity: 1;
}

.site-popup__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.site-popup__panel--collapsed .site-popup__close {
  position: static;
  width: 1.75rem;
  height: 1rem;
  font-size: 1.5rem;
}

.site-popup__title {
  margin: 0 2rem 0 0;
}

.site-popup__panel--collapsed .site-popup__title {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transform: translateY(3px);
}

.site-popup__title--expandable {
  cursor: pointer;
}

.site-popup__description {
  margin-top: var(--pad-2);
  font-size: var(--body);
}

.site-popup__button {
  margin-top: var(--pad-2);
}

.site-popup-fade-enter-active,
.site-popup-fade-leave-active {
  transition: opacity 0.3s ease;
}

.site-popup-fade-enter-from,
.site-popup-fade-leave-to {
  opacity: 0;
}
</style>
