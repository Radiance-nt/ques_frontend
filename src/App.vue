<template>
  <div id="app">
    <button @click="fetchMarkdown">Render Markdown</button>
    <div class="markdown-container">
      <div v-for="(item, index) in markdownList" :key="index" class="markdown-box">
        <div v-html="markdownToHtml(item)"></div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { marked } from 'marked';

export default {
  name: 'App',
  data() {
    return {
      markdown: '',
      markdownList: []
    };
  },
  methods: {
    markdownToHtml(markdown) {
      return marked(markdown);
    },
    fetchMarkdown() {
      axios.get('http://localhost:5000/api/get_content')
        .then(response => {
          this.markdownList.push(response.data);
        })
        .catch(error => {
          console.error('Error fetching markdown:', error);
        });
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.markdown-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.markdown-box {
  min-width: 600px;
  background-color: #f0f0f0;
  padding: 20px;
  margin-bottom: 20px;
  text-align: left;
  border-radius: 10px;
}
</style>