package com.example.todo.service;

import com.example.todo.model.Todo;
import com.example.todo.repository.TodoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TodoService {

    private final TodoRepository repository;

    public TodoService(TodoRepository repository) {
        this.repository = repository;
    }

    public List<Todo> getAllTodos() {
        return repository.findAll();
    }

    public Todo createTodo(Todo todo) {
        todo.setId(null);
        todo.setTitle(todo.getTitle().trim());
        if (todo.getDescription() != null) {
            todo.setDescription(todo.getDescription().trim());
        }
        todo.setCompleted(false);
        todo.setCreatedAt(LocalDateTime.now());
        return repository.save(todo);
    }

    public Todo updateTodo(String id, Todo updatedTodo) {
        Todo existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        existing.setTitle(updatedTodo.getTitle().trim());
        existing.setDescription(
                updatedTodo.getDescription() == null ? "" : updatedTodo.getDescription().trim()
        );
        existing.setCompleted(updatedTodo.isCompleted());

        return repository.save(existing);
    }

    public Todo toggleTodo(String id) {
        Todo todo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        todo.setCompleted(!todo.isCompleted());
        return repository.save(todo);
    }

    public void deleteTodo(String id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Todo not found");
        }
        repository.deleteById(id);
    }
}
