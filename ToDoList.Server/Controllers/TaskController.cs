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
            //dbContext.Database.EnsureCreated();
            //dbContext.Database.Migrate();
            context = dbContext;
        }

        // GET: api/<TaskController>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ToDoTask>>> ListAll()
        {
            var ret = await context.Tasks.ToListAsync();
            return ret;
        }

        // GET api/<TaskController>/
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

        // POST api/<TaskController>
        [HttpPost]
        public async Task<ActionResult<ToDoTask>> Post([FromBody] ToDoTask task)
        {
            context.Tasks.Add(task);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = task.Id }, task);
        }

        // PUT api/<TaskController>/5
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

        // DELETE api/<TaskController>/5
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
