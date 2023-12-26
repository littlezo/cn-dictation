<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        background-color: #ff7e5f;
      }
      * {
        touch-action: manipulation;
        -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
        -webkit-tap-highlight-color:rgba(0,0,0,0); 
      }
</style>
