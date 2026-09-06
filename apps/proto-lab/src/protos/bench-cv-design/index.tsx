import {
  cover,
  linkList,
  person,
  projectList,
  toolGroupList,
} from '../_cv-data';

export const protoMeta = {
  question: 'cv via design',
  title: 'cv · design',
};

export const Proto = () => {
  const linkListJSX = linkList.map((link) => {
    return (
      <li key={link.label}>
        <a href={link.href}>{link.label}</a>
      </li>
    );
  });

  const toolGroupListJSX = toolGroupList.map((group) => {
    return (
      <li key={group.name}>
        {group.name}: {group.toolList.join(', ')}
      </li>
    );
  });

  const projectListJSX = projectList.map((project) => {
    return (
      <li key={project.dates}>
        {project.dates} — {project.employer} — {project.role}
        <p>{project.description}</p>
      </li>
    );
  });

  return (
    <div>
      <h1>{person.name}</h1>
      <ul>
        <li>{person.role}</li>
        <li>{person.location}</li>
        <li>{person.email}</li>
        <li>fluent: {person.fluent.join(', ')}</li>
      </ul>
      <ul>{linkListJSX}</ul>
      <h2>{cover.greeting}</h2>
      <p>{cover.intro}</p>
      <p>{cover.lookingFor}</p>
      <p>
        {cover.sideProject.text}{' '}
        <a href={cover.sideProject.href}>{cover.sideProject.label}</a>
      </p>
      <h2>tools I use</h2>
      <ul>{toolGroupListJSX}</ul>
      <h2>portfolio</h2>
      <ul>{projectListJSX}</ul>
    </div>
  );
};
