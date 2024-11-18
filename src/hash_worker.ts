// In this file, you can define the worker script that will compute the
// hash digest for a given file. Of course, it is up to you what kind
// of messages should the worker receive/send.
import { AsyncSha256 } from "./sha-256.js";
import { FileHashingProgress } from "./hash_worker_messages.js";

onmessage = async (e) => {
  const file = e.data as File;
  if (!file) {
    postMessage(null);
    return;
  }

  const startedTime = new Date();
  const reader = new FileReader();

  reader.onload = onFileLoaded();

  reader.readAsText(file);

  function onFileLoaded() {
    return () => {
      // The result should always be a string in this case.
      const fileData = reader.result as string;

      // At this point, we know how much data we have.
      const fileProgress: FileHashingProgress = {
        fileName: file.name,
        total: fileData.length,
        remaining: fileData.length,
        elapsed: 0,
        hash: null,
      };

      postMessage(fileProgress);

      const hasher = new AsyncSha256();
      hasher.async_digest(
        fileData,
        (hash) => {
          // We are done.
          const finishedProgress: FileHashingProgress = {
            ...fileProgress,
            hash,
            remaining: 0,
            elapsed: new Date().getTime() - startedTime.getTime(),
          };

          postMessage(finishedProgress);
        },
        (remaining) => {
          // Update progress.
          const updatedProgress: FileHashingProgress = {
            ...fileProgress,
            remaining,
            elapsed: new Date().getTime() - startedTime.getTime(),
          };

          postMessage(updatedProgress);
        },
      );
    };
  }
};
