<script lang="ts">
    import '../app.css';
    let { children } = $props();
</script>

<div class="min-h-screen relative overflow-hidden">
    <!-- Atmospheric Glows -->
    <div class="fixed inset-0 pointer-events-none z-0">
        <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-800/10 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-900/10 rounded-full blur-[100px]"></div>
    </div>

    <main class="relative z-10 w-full max-w-[1700px] mx-auto pt-16 px-6 pb-20">
        {@render children()}
    </main>
</div>


