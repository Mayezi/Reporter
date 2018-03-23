<template>
    <div id="main" class="app-main">
        <router-view></router-view>
        <BackTop :height="100"></BackTop>
    </div>
</template>

<script>
    export default {
    }    
</script>

<style>
html,body{
    width: 100%;
    height: 100%;
    background: #f5f7f9;
}
.app-main{
    width: 100%;
    height: 100%;
}
</style>
