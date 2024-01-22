<script>
  import { onMount } from "svelte";

  let ws;
  let recording = false;
  onMount(() => {
    let host = window.location.hostname
    ws = new WebSocket(`ws:\\${host}:7969`);
  });

const increment = () => {
    ws.send('hello');
  }
</script>

<button on:click={increment}>
  <span>{recording ? 'stop' : 'start'} recording</span>
</button>
