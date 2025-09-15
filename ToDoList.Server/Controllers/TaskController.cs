using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using ToDoList.Server.Database;
using ToDoList.Server.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ToDoList.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskController : ControllerBase
    {
        private readonly TaskDbContext context;

        public TaskController(TaskDbContext dbContext)
        {
            context = dbContext;
        }

        /// <summary>
        /// GET: api/Task
        /// Lists all Tasks
        /// </summary>
        /// <returns>A list of all Tasks</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ToDoTask>>> ListAll()
        {
            var ret = await context.Tasks.ToListAsync();
            return ret;
        }

        /// <summary>
        /// GET api/Task/{id}
        /// Finds task by id.
        /// </summary>
        /// <param name="id">The GUID of the Task being searched for</param>
        /// <exception cref="404">If a Task matching <paramref name="id"/> is not found</exception>
        /// <returns>The task that matches the given GUID</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ToDoTask>> Get(Guid id)
        {
            var task = await context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }
            return task;
        }

        /// <summary>
        /// POST api/Task
        /// Adds a new Task to the database.
        /// </summary>
        /// <param name="task">The new Task object</param>
        /// <returns>The new <paramref name="task"/> object</returns>
        [HttpPost]
        public async Task<ActionResult<ToDoTask>> Post([FromBody] ToDoTask task)
        {
            context.Tasks.Add(task);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = task.Id }, task);
        }

        /// <summary>
        /// PUT api/Task/{id}
        /// Updates the properties of the Task matching the given <paramref name="id"/>.
        /// </summary>
        /// <param name="id">The GUID of the Task to update</param>
        /// <param name="task">Task object holding all the updated properties.</param>
        /// <exception cref="404">If a Task matching <paramref name="id"/> is not found</exception>
        /// <returns>The updated <paramref name="task"/> object</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(Guid id, [FromBody] ToDoTask task)
        {
            if (id != task.Id)
            {
                return BadRequest();
            }

            context.Entry(task).State = EntityState.Modified;

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        /// <summary>
        /// DELETE api/Task/{id}
        /// Removes Task matching the given <paramref name="id"/> from database
        /// </summary>
        /// <param name="id">The GUID of the Task to delete</param>
        /// <exception cref="404">If a Task matching <paramref name="id"/> is not found</exception>
        /// <returns>204 No Content</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var task = await context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }
            context.Tasks.Remove(task);
            await context.SaveChangesAsync();

            return NoContent();
        }

        // Helper method to check if a task exists
        private bool TaskExists(Guid id)
        {
            return context.Tasks.Any(e => e.Id == id);
        }
    }
}
