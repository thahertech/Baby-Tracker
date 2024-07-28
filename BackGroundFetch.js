import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

// Define a background fetch task
const TASK_NAME = 'background-fetch-task';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    // Perform your background fetch operation here
    // For example, fetching sleep data or updating records
    console.log('Background fetch task running...');
    // Simulating a fetch operation
    // await fetchSleepData(); // Replace with your actual function

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background fetch failed', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background fetch task
const registerBackgroundFetch = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error('Error registering background fetch:', error);
  }
};

// Register the task when the app starts
registerBackgroundFetch();
