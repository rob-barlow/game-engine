mod converter;
mod maze;
mod grid;
mod position;
use maze::Maze;
use converter::converter::to_binary_vec;

pub fn create_new_maze(width: usize, height: usize) -> (Vec<Vec<u8>>, [u8; 32]) {
    let mut maze = Maze::new(width, height);
    let seed = maze.get_seed();

    maze.generate();
    let binary_maze_vec = to_binary_vec(&maze);

    return (binary_maze_vec, seed);
}
