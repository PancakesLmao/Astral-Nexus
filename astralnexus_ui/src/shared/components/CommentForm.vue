<template>
  <form @submit.prevent="submitComment">
    <h3>Add Comment</h3>
    <textarea v-model="comment" placeholder="Write your comment..."></textarea>
    <button type="submit">Submit Comment</button>
  </form>
</template>

<script lang="ts">
export default {
  name: 'CommentForm',
  data() {
    return {
      comment: ''
    }
  },
  methods: {
    submitComment() {
      // Comment submission logic
      console.log('Comment submitted:', this.comment)
      this.comment = ''
    }
  }
}
</script>
