const apiBase = "https://bv43jgape8.execute-api.ap-northeast-1.amazonaws.com/prod/tasks";

document.getElementById("add-task-btn").addEventListener("click", async () => {
  const taskInput = document.getElementById("task-input");
  const taskTitle = taskInput.value.trim();

  if (!taskTitle) {
    alert("Please enter a task.");
    return;
  }

  try {
    const response = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: taskTitle }),
    });

    if (response.ok) {
      const task = await response.json();
      console.log("Received task:", task);

      const taskId = task.task.taskId.S;
      const title = task.task.title.S;

      addTaskToList(taskId, title);
      taskInput.value = "";
    } else {
      alert("Failed to add task.");
    }
  } catch (error) {
    console.error("Error adding task:", error);
  }
});

function addTaskToList(taskId, taskTitle) {
  if (!taskId) {
    console.log("Error: taskTitle is an object!", taskTitle);
    return;
  }
  const taskList = document.getElementById("task-list");
  const taskItem = document.createElement("li");
  taskItem.textContent = taskTitle;

  const taskText = document.createElement("span");
  taskText.textContent = taskTitle;

  const editButton = document.createElement("button");
  editButton.textContent = "編集";
  editButton.style.marginLeft = "10px";
  editButton.addEventListener("click", () => editTask(taskId, taskText));

  // 削除ボタンを追加
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "削除";
  deleteButton.style.marginLeft = "5px";
  deleteButton.addEventListener("click", async () => {
    if (confirm("このタスクを削除しますか？")) {
      console.log("Deleting task:", taskId);
      await deleteTask(taskId, taskItem);
    }
  });  

  taskItem.appendChild(taskText);
  taskItem.appendChild(editButton);
  taskItem.appendChild(deleteButton);
  taskList.appendChild(taskItem);
}

async function fetchTasks() {
    try {
      const response = await fetch(apiBase, { method: "GET" });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks.");
      }
  
      const data = await response.json();
      console.log("Fetched tasks:", data);
  
      const taskList = document.getElementById("task-list");
      taskList.innerHTML = ""; // 一度リストをクリアしてから追加
  
      data.tasks.forEach(task => {
        console.log("Adding task:", task);
        addTaskToList(task.taskId, task.title);
      });
  
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
}
  
async function deleteTask(taskId, taskElement) {
  try {
    const response = await fetch(`${apiBase}/${taskId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });

    if (response.ok) {
      taskElement.remove(); // 成功したらUIから削除
      console.log(`Task ${taskId} deleted successfully`);
    } else {
      console.error("Failed to delete task");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

function editTask(taskId, taskTextElement) {
  const currentTitle = taskTextElement.textContent;

  // 入力フィールドを作成
  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.value = currentTitle;

  // 保存ボタンを作成
  const saveButton = document.createElement("button");
  saveButton.textContent = "保存";
  saveButton.style.marginLeft = "5px";
  saveButton.addEventListener("click", async () => {
    const newTitle = inputField.value.trim();
    if (!newTitle) {
      alert("タスク名を入力してください。");
      return;
    }

    await updateTask(taskId, newTitle);
    taskTextElement.textContent = newTitle;

    // 編集モード終了
    taskTextElement.style.display = "inline";
    saveButton.remove();
    inputField.remove();
  });

  // 既存のテキストを非表示にして入力フィールドと保存ボタンを追加
  taskTextElement.style.display = "none";
  taskTextElement.parentNode.insertBefore(inputField, taskTextElement);
  taskTextElement.parentNode.insertBefore(saveButton, inputField.nextSibling);
}

async function updateTask(taskId, newTitle) {
  try {
    const response = await fetch(`${apiBase}/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    if (response.ok) {
      console.log(`Task ${taskId} updated successfully`);
    } else {
      console.error("Failed to update task");
    }
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

// **ページ読み込み時にタスク一覧を取得**
document.addEventListener("DOMContentLoaded", fetchTasks);
