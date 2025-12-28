using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API;

public class Todo
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public bool IsCompleted { get; set; }
}
