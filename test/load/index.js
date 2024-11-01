import http from "k6/http";
import { sleep, check } from "k6";
import encoding from "k6/encoding";

const fileData = open("data/large_file.csv");

const users = [
  {
    user: "admin",
    pass: "adminPassword",
  },
  {
    user: "user1",
    pass: "user1Password",
  },
  {
    user: "user2",
    pass: "user2Password",
  },
  {
    user: "user3",
    pass: "user2Password",
  },
  {
    user: "user4",
    pass: "user2Password",
  },
];

let registerUser = true;

export const options = {
  vus: 5,
  duration: "1m",
};

export default function () {
  if (registerUser) {
    users.forEach((u) => {
      http.post("http://localhost:3000/users", {
        username: u.user,
        password: u.pass,
      });
    });

    registerUser = false;
  }

  const user = users[__VU - 1];
  const encodedCredentials = encoding.b64encode(
    `${user["user"]}:${user["pass"]}`,
  );

  const params = {
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
    },
  };

  const url = "http://localhost:3000/upload";

  const payload = {
    file: http.file(fileData, "large_file.csv", "text/csv"),
  };

  const res = http.post(url, payload, params);
  console.log(res.body);

  check(res, {
    "status is 201": (r) => r.status === 201,
  });
}
