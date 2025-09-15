using Microsoft.EntityFrameworkCore;
using ToDoList.Server.Models;

namespace ToDoList.Server.Database
{
    public class TaskDbContext : DbContext
    {
        public TaskDbContext(DbContextOptions<TaskDbContext> options) : base(options)
        {
        }
        public DbSet<ToDoTask> Tasks { get; set; }
    }
}
