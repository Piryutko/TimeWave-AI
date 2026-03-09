<script lang="ts">
    import '../app.css';
    let { children } = $props();
</script>

<div class="min-h-screen bg-bg-light text-gray-900 selection:bg-brand-mint selection:text-white pb-12">
    <!-- Header -->
    <header class="py-6 px-8 flex items-center justify-between border-b border-gray-200 glass-panel sticky top-0 z-50">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-teal-400 flex items-center justify-center text-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h1 class="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">TimeWave AI</h1>
        </div>
    </header>

    <main class="w-full max-w-6xl mx-auto mt-8 px-4">
        {@render children()}
    </main>
</div>
