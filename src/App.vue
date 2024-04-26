<template>
  <div id="app">
    <button @click="fetchContent">Fetch Content</button>
    <div class="content-container">
      <div v-for="(item, index) in contentList" :key="index" class="content-box">
        <div v-if="item.type === 1" v-html="markdownToHtml(item.content)"></div>
        <div v-else-if="item.type === 2">
          <video :src="item.content" controls></video>
        </div>
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
      contentList: []
    };
  },
  methods: {
    markdownToHtml(markdown) {
      return marked(markdown);
    },
    fetchContent() {
      axios.get('http://localhost:5000/api/get_content')
        .then(response => {
          const { type, content } = response.data;
          this.contentList.push({ type, content });
        })
        .catch(error => {
          console.error('Error fetching content:', error);
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

.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content-box {
  min-width: 600px;
  background-color: #f0f0f0;
  padding: 20px;
  margin-bottom: 20px;
  text-align: left;
  border-radius: 10px;
}
</style>