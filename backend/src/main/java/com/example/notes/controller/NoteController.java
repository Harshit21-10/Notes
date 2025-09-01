package com.example.notes.controller;

import com.example.notes.entity.Note;
import com.example.notes.repository.NoteRepository;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import jakarta.validation.Valid;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "*"}) // restrict in prod
public class NoteController {

    private final NoteRepository repo;

    public NoteController(NoteRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Note> all() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> one(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Note> create(@Valid @RequestBody Note note, UriComponentsBuilder ucb) {
        // ignore id/version if provided
        note.setId(null);
        note.setVersion(null);
        Note saved = repo.save(note);
        URI location = ucb.path("/api/notes/{id}").buildAndExpand(saved.getId()).toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Note incoming) {
        return repo.findById(id).map(existing -> {
            existing.setTitle(incoming.getTitle());
            existing.setContent(incoming.getContent());
            // Optionally copy version if client supplies it to detect stale write:
            if (incoming.getVersion() != null) {
                existing.setVersion(incoming.getVersion());
            }
            try {
                Note saved = repo.save(existing);
                return ResponseEntity.ok(saved);
            } catch (OptimisticLockingFailureException ex) {
                // optimistic lock triggered
                return ResponseEntity.status(409).body("Conflict: note was modified by someone else");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
