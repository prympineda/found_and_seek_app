import Vue from "vue";
import App from './App.vue'
import "./plugins/bootstrap-vue";

new Vue({
    render: h => h(App)
}).$mount("#app");