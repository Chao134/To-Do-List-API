using System.Diagnostics.CodeAnalysis;

namespace ToDoList.Server.Models
{
    public class ToDoTask
    {
        public required Guid Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public bool IsCompleted { get; set; }

        [SetsRequiredMembers]
        public ToDoTask() 
        {
            Id = Guid.NewGuid();
        }
    }
}
