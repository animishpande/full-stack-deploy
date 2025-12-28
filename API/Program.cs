var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<TodoDb>(options => options.UseInMemoryDatabase("TodoList"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "TodoAPI";
    config.Title = "Todo API v1";
    config.Version = "v1.0.0";
});

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "Frontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", 
                                "https://localhost:3000",
                                "https://ap-learn.azurewebsites.net/")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi(config =>
    {
        config.DocumentTitle = "TodoAPI";
        config.Path = "/swagger";
        config.DocumentPath = "/swagger/{documentName}/swagger.json";
        config.DocExpansion = "list";
    });
}

app.MapGet("/todoitems", async (TodoDb db) => await db.Todos.ToListAsync());

app.MapGet("/todoitems/complete", async (TodoDb db) => await db.Todos.Where(t => t.IsCompleted).ToListAsync());

app.MapGet("/todoitems/{id}", async (Guid id, TodoDb db) => 
    await db.Todos.FindAsync(id)
        is Todo todo 
            ? Results.Ok(todo)
            : Results.NotFound("Todo Item not found"));

app.MapPost("/todoitems", async (TodoDTO todoDto, TodoDb db) =>
{
    Todo newTodo = new Todo()
    {
        Id = Guid.NewGuid(),
        Title = todoDto.Title,
        IsCompleted = todoDto.IsCompleted
    };
    db.Todos.Add(newTodo);
    await db.SaveChangesAsync();

    return Results.Created($"/todoitems/{newTodo.Id}", todoDto);
});

app.MapPut("/todoitems/{id}", async (Guid id, TodoDTO updateTodo, TodoDb db) =>
{
    Todo? existingTodo = await db.Todos.FindAsync(id);

    if (existingTodo is null) return Results.NotFound("Todo Item not found");

    existingTodo.Title = updateTodo.Title;
    existingTodo.IsCompleted = updateTodo.IsCompleted;

    await db.SaveChangesAsync();

    return Results.Ok("Updated Todo.");
});

app.MapPut("/todoitems/complete/{title}", async (string title, TodoDb db) =>
{
    Todo? existingTodo = await db.Todos.FirstOrDefaultAsync(t => t.Title == title);

    if (existingTodo is null) return Results.NotFound("Todo Item not found");

    existingTodo.IsCompleted = true;

    await db.SaveChangesAsync();

    return Results.Ok($"Completed Todo - {title}");
});

app.MapDelete("/todoitems/{id}", async (Guid id, TodoDb db) =>
{
    if (await db.Todos.FindAsync(id) is Todo todo)
    {
        db.Todos.Remove(todo);
        await db.SaveChangesAsync();
        return Results.Ok("Todo Item deleted.");
    }
    return Results.NotFound("Todo Item not found");
});

app.UseCors("Frontend");
app.Run();
